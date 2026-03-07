from rest_framework.exceptions import ValidationError

from apps.dataset.models import Dataset
from apps.dataset.services.csv_validation import validate_csv_against_schema
from apps.dataset.services.enqueue import enqueue_parse_dataset


def create_dataset(owner, name, source_file, schema) -> Dataset:
    """
    Dataset を作成するサービス関数。
    - CSV × schema の整合性チェック
    - データベース保存
    - 保存後に非同期ジョブ呼び出し
    """
    try:
        validate_csv_against_schema(source_file, schema)
    except ValueError as e:
        raise ValidationError(str(e))

    dataset = Dataset.objects.create(
        owner=owner,
        name=name,
        source_file=source_file,
        schema=schema,
    )

    enqueue_parse_dataset(dataset.id)  # type: ignore
    return dataset
