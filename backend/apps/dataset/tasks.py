from celery import shared_task

from apps.dataset.services.tasks_runner import parse_dataset_sync


@shared_task
def parse_dataset_task(dataset_id: int):
    # Celery タスクから同期関数を呼ぶだけ
    parse_dataset_sync(dataset_id)
