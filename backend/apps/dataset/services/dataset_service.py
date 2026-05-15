from rest_framework.exceptions import ValidationError

from apps.dataset.models import Dataset
from apps.dataset.services.enqueue import enqueue_parse_dataset
from apps.dataset.services.ingestion.csv_validation import validate_csv_against_schema


def create_dataset(
    *,
    owner=None,
    anonymous_id=None,
    name: str,
    source_file,
    schema: dict,
) -> Dataset:
    """
    Dataset を作成するサービス関数。

    - CSV × schema の整合性チェック
    - owner / anonymous_id の排他制御
    - データベース保存
    - 非同期ジョブ投入
    """

    # --- owner / anonymous_id の排他チェック ---
    if bool(owner) == bool(anonymous_id):
        raise ValidationError("Exactly one of owner or anonymous_id must be provided.")

    # --- CSV validation ---
    try:
        validate_csv_against_schema(source_file, schema)
    except ValueError as e:
        raise ValidationError(str(e))

    # --- create dataset ---
    dataset = Dataset.objects.create(
        owner=owner,
        anonymous_id=anonymous_id,
        name=name,
        source_file=source_file,
        schema=schema,
    )

    # --- async processing ---
    enqueue_parse_dataset(dataset.id)  # type: ignore

    return dataset
