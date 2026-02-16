from django.conf import settings

from apps.dataset.services.tasks_runner import parse_dataset_sync
from apps.dataset.tasks import parse_dataset_task


def enqueue_parse_dataset(dataset_id: int):
    """
    CSV パースタスクを実行／キューに投げる
    開発環境：Celery eager
    本番環境：同期処理
    """
    if settings.IS_DEVELOPMENT:
        # 開発環境 → Celery で即時実行（eager）
        parse_dataset_task.delay(dataset_id)
    elif settings.IS_PRODUCTION:
        # 本番でもまずは同期実行
        parse_dataset_sync(dataset_id)
