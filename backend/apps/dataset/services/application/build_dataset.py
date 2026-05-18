from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.dataset.models import Dataset
from apps.dataset.services.ingestion.csv_validation import validate_csv_against_schema
from apps.dataset.services.ingestion.enqueue import enqueue_parse_dataset


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

    Responsibilities:
    - owner / anonymous_id の排他制御
    - CSV validation
    - expires_at の設定
    - Dataset 作成
    - 非同期解析ジョブ投入
    """

    # --- owner / anonymous_id validation ---
    if bool(owner) == bool(anonymous_id):
        raise ValidationError("Exactly one of owner or anonymous_id must be provided.")

    # --- CSV validation ---
    try:
        validate_csv_against_schema(source_file, schema)
    except ValueError as e:
        raise ValidationError(str(e))

    # --- expiration policy ---
    expires_at = None

    if anonymous_id is not None:
        expires_at = timezone.now() + timedelta(
            days=settings.ANONYMOUS_DATASET_TTL_DAYS
        )

    # --- create dataset ---
    dataset = Dataset.objects.create(
        owner=owner,
        anonymous_id=anonymous_id,
        name=name,
        source_file=source_file,
        schema=schema,
        expires_at=expires_at,
    )

    # --- async processing ---
    enqueue_parse_dataset(dataset.id)  # type: ignore[arg-type]

    return dataset
