from celery import shared_task  # type: ignore

from apps.dataset.models import Dataset
from apps.dataset.services.csv_parser import parse_dataset_csv


@shared_task
def parse_dataset_task(dataset_id: int):
    dataset = Dataset.objects.get(pk=dataset_id)

    # mark_processing() は冪等性チェックも兼ねている
    # 冪等性 & 多重実行ガード
    if not dataset.mark_processing():
        return  # すでに解析中／完了済みなら何もしない

    try:
        # CSV を解析して DataPoint 作成
        total_rows = parse_dataset_csv(dataset)

        # 成功時の状態更新
        dataset.mark_parsed(result={"row_count": total_rows, "status": "parsed"})

    except Exception as e:
        # 失敗時の状態更新
        dataset.mark_failed(e)
        raise
