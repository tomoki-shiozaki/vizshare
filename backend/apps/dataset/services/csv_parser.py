import csv
import io
import re
from datetime import datetime

from django.utils.dateparse import parse_datetime
from django.utils.timezone import is_naive, make_aware

from apps.dataset.models import DataPoint, Dataset

BATCH_SIZE = 1000


def parse_row_time(raw_time: str):
    """
    CSV の time 列文字列を datetime に変換（MVP対応）。
    - 対応: 年のみ, 年-月, 年/月, 完全日付(YYYY-MM-DD, YYYY/MM/DD, DD/MM/YYYY)
    - 非対応形式は None
    """
    if not raw_time:
        return None

    # まず ISO 形式の日時や YYYY-MM-DD は parse_datetime で対応
    dt = parse_datetime(raw_time)
    if dt:
        if is_naive(dt):
            dt = make_aware(dt)
        return dt

    # 年のみ: YYYY または YYYY.0
    match_year = re.fullmatch(r"(\d{4})(?:\.0)?", raw_time)
    if match_year:
        year = int(match_year.group(1))
        dt = datetime(year, 1, 1)
        return make_aware(dt)

    # 年-月: YYYY-MM または YYYY/MM
    match_ym = re.fullmatch(r"(\d{4})[-/](\d{1,2})", raw_time)
    if match_ym:
        year, month = map(int, match_ym.groups())
        dt = datetime(year, month, 1)
        return make_aware(dt)

    # 完全日付: YYYY-MM-DD, YYYY/MM/DD
    match_ymd = re.fullmatch(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", raw_time)
    if match_ymd:
        year, month, day = map(int, match_ymd.groups())
        dt = datetime(year, month, day)
        return make_aware(dt)

    # 完全日付: DD/MM/YYYY
    match_dmy = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", raw_time)
    if match_dmy:
        day, month, year = map(int, match_dmy.groups())
        dt = datetime(year, month, day)
        return make_aware(dt)

    # それ以外（期間ラベルや任意ステップなど）は None
    return None


def parse_value(value_str: str | None, *, row: int, metric: str) -> float | None:
    if value_str is None:
        return None

    value_str = value_str.strip()
    if not value_str:
        return None

    try:
        return float(value_str)
    except ValueError:
        raise ValueError(f"Invalid value: {value_str} (row={row}, metric={metric})")


def parse_dataset_csv(dataset: Dataset) -> int:
    """
    wide CSV を long DataPoint へ変換
    """
    with dataset.source_file.open("rb") as f:
        raw_bytes = f.read()

        # CSVの文字コードを自動判定
        # 優先順:
        # 1. UTF-8 with BOM (ExcelのUTF-8保存対策)
        # 2. UTF-8 (標準的なCSV)
        # 3. CP932 / Shift-JIS (日本のExcel保存対策)
        for encoding in ("utf-8-sig", "utf-8", "cp932"):
            try:
                text_file = io.StringIO(raw_bytes.decode(encoding))
                break
            except UnicodeDecodeError:
                continue
        else:
            raise ValueError(
                "CSVの文字コードを判定できません。UTF-8（BOM付き含む）または Shift-JIS 形式で保存してください。"
            )

        reader = csv.DictReader(text_file)
        headers = [h.strip() for h in reader.fieldnames or [] if h]
        if not headers:
            raise ValueError("CSV にヘッダーがありません")

        # schema から列名取得
        schema = dataset.schema
        time_col = schema.get("time")
        entity_col = schema.get("entity")
        metric_cols = schema["metrics"]

        buffer: list[DataPoint] = []
        total = 0

        # CSV を1行ずつ読み込む。
        # idx は 0 から始まる行番号で、DataPoint の row_index に使用
        for row_idx, row in enumerate(reader):
            raw_time = row.get(time_col, "")
            parsed_time = parse_row_time(raw_time)

            entity = row.get(entity_col) if entity_col else None
            entity = entity or DataPoint.DEFAULT_ENTITY

            for metric in metric_cols:
                value_str = row.get(metric, "")

                value = parse_value(value_str, row=row_idx, metric=metric)

                buffer.append(
                    DataPoint(
                        dataset=dataset,
                        raw_time=raw_time,
                        time=parsed_time,
                        entity=entity,
                        metric=metric,
                        value=value,
                        order_index=row_idx,
                    )
                )

            if len(buffer) >= BATCH_SIZE:
                DataPoint.objects.bulk_create(buffer, batch_size=BATCH_SIZE)
                total += len(buffer)
                buffer.clear()

        if buffer:
            DataPoint.objects.bulk_create(buffer, batch_size=BATCH_SIZE)
            total += len(buffer)

    return total
