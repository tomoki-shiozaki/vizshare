import csv
import io
from datetime import datetime

from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.utils.timezone import is_naive, make_aware

from apps.dataset.models import DataPoint, Dataset

BATCH_SIZE = 1000


def parse_row_time(raw_time: str):
    if not raw_time:
        return None

    dt = parse_datetime(raw_time)

    if dt is None:
        # YYYY
        if raw_time.isdigit() and len(raw_time) == 4:
            dt = datetime(int(raw_time), 1, 1)
        # YYYY-MM
        elif len(raw_time) == 7 and raw_time[4] == "-":
            year, month = map(int, raw_time.split("-"))
            dt = datetime(year, month, 1)
        else:
            return None

    if is_naive(dt):
        dt = make_aware(dt)

    return dt


def validate_schema(schema, headers):
    time_col = schema.get("time")
    metrics = schema.get("metrics")

    if not time_col:
        raise ValueError("time 必須")

    if not metrics:
        raise ValueError("metrics は最低1つ必要")

    for col in [time_col, schema.get("entity")]:
        if col and col not in headers:
            raise ValueError(f"{col} が存在しません")

    for m in metrics:
        if m not in headers:
            raise ValueError(f"metric {m} が存在しません")


def parse_dataset_csv(dataset: Dataset) -> int:
    """
    wide CSV を long DataPoint へ変換
    """
    with dataset.source_file.open("rb") as f:
        # バイナリファイルをテキストとして読み込み、CSVを辞書形式で扱えるようにする
        text_file = io.TextIOWrapper(f, encoding="utf-8")
        reader = csv.DictReader(text_file)

        headers = reader.fieldnames or []
        if not headers:
            raise ValueError("CSV にヘッダーがありません")

        # schema から列名取得
        schema = dataset.schema or {}

        validate_schema(schema, headers)

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
            entity = entity or "default"

            for metric in metric_cols:
                value_str = row.get(metric, "")

                try:
                    value = float(value_str) if value_str != "" else None
                except ValueError:
                    raise ValueError(
                        f"Invalid value: {value_str} (row={row_idx}, metric={metric})"
                    )

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
                with transaction.atomic():
                    DataPoint.objects.bulk_create(buffer)
                total += len(buffer)
                buffer.clear()

        if buffer:
            with transaction.atomic():
                DataPoint.objects.bulk_create(buffer)
            total += len(buffer)

    return total
