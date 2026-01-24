import csv
import io
from datetime import datetime

from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.utils.timezone import is_naive, make_aware

from apps.dataset.models import DataPoint, Dataset

BATCH_SIZE = 1000


# -----------------------------
# 1️⃣ 時刻パース関数
# -----------------------------
def parse_row_time(raw_time: str, row_idx: int):
    if not raw_time:
        raise ValueError(f"time が空です (row={row_idx})")

    dt = parse_datetime(raw_time)

    if dt is None:
        # 年だけなら補完して datetime 作成
        if raw_time.isdigit() and len(raw_time) == 4:
            dt = datetime(int(raw_time), 1, 1)
        # 年月なら補完
        elif len(raw_time) == 7 and raw_time[4] == "-":  # YYYY-MM
            year, month = map(int, raw_time.split("-"))
            dt = datetime(year, month, 1)
        else:
            # 正確な日時に変換できなければ None を返す
            return None

    if is_naive(dt):
        dt = make_aware(dt)

    return dt


# -----------------------------
# 2️⃣ 値パース関数
# -----------------------------
def parse_row_value(value_str: str, row_idx: int):
    try:
        return float(value_str)
    except (TypeError, ValueError):
        raise ValueError(f"Invalid value: {value_str} (row={row_idx})")


# -----------------------------
# 3️⃣ メイン CSV パース関数
# -----------------------------
def parse_dataset_csv(dataset: Dataset) -> int:
    """
    Dataset.source_file の CSV を parse して DataPoint を作成する
    """
    # CSV 解析だけに集中 → 状態変更はタスク側で行う

    # 解析に使う列名
    schema_columns = dataset.schema or {}
    time_col = schema_columns.get("time")
    value_col = schema_columns.get("value")
    series_col = schema_columns.get("series", "")

    if not time_col or not value_col:
        raise ValueError("schema に time 列と value 列の情報がありません")

    with dataset.source_file.open("rb") as f:
        # バイナリファイルをテキストとして読み込み、CSVを辞書形式で扱えるようにする
        text_file = io.TextIOWrapper(f, encoding="utf-8")
        reader = csv.DictReader(text_file)

        # CSV に指定列が存在するかチェック
        csv_columns = set(reader.fieldnames or [])
        required_columns = {time_col, value_col}
        if not required_columns.issubset(csv_columns):
            raise ValueError(
                f"CSV に指定された列が存在しません: required={required_columns}, csv={csv_columns}"
            )

        buffer: list[DataPoint] = []
        total_rows = 0

        # CSV を1行ずつ読み込む。
        # idx は 0 から始まる行番号で、DataPoint の row_index に使用
        for idx, row in enumerate(reader):
            # 指定された列名で値を取得
            dt_str = row.get(time_col, "")
            val_str = row.get(value_col, "")
            series_val = row.get(series_col, "") if series_col else ""

            dp = DataPoint(
                dataset=dataset,
                raw_time=dt_str,
                time=parse_row_time(dt_str, idx),
                value=parse_row_value(val_str, idx),
                series=series_val,
                row_index=idx,
            )
            buffer.append(dp)

            # chunk insert
            if len(buffer) >= BATCH_SIZE:
                with transaction.atomic():
                    DataPoint.objects.bulk_create(buffer)
                total_rows += len(buffer)
                buffer.clear()

        if buffer:
            with transaction.atomic():
                DataPoint.objects.bulk_create(buffer)
            total_rows += len(buffer)

    # CSV 解析自体は成功 → タスク側で mark_parsed を呼ぶ
    return total_rows
