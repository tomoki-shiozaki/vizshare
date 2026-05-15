from apps.dataset.services.tasks_runner import parse_dataset_sync


def enqueue_parse_dataset(dataset_id: int):
    """
    CSV パースタスクを実行
    現在は同期処理のみ
    """
    parse_dataset_sync(dataset_id)
