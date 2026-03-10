import io

import pytest
from django.core.files.base import ContentFile
from rest_framework.exceptions import ValidationError

from apps.dataset.models import Dataset
from apps.dataset.services.dataset_service import create_dataset


@pytest.mark.django_db
def test_create_dataset_success(mocker, user):
    # CSV検証関数と非同期ジョブをモック
    mock_validate = mocker.patch(
        "apps.dataset.services.dataset_service.validate_csv_against_schema"
    )
    mock_enqueue = mocker.patch(
        "apps.dataset.services.dataset_service.enqueue_parse_dataset"
    )

    # ダミーファイル
    source_file = ContentFile(b"time,metric1\n1,10\n", name="test.csv")

    schema = {"time": "time", "metrics": ["metric1"]}

    dataset = create_dataset(
        owner=user,
        name="Test Dataset",
        source_file=source_file,
        schema=schema,
    )

    assert Dataset.objects.filter(pk=dataset.pk).exists()
    assert dataset.owner == user
    assert dataset.name == "Test Dataset"

    mock_validate.assert_called_once_with(source_file, schema)
    mock_enqueue.assert_called_once_with(dataset.id)  # type: ignore


@pytest.mark.django_db
def test_create_dataset_validation_error(mocker, user):
    # validate_csv_against_schema が ValueError を出す場合
    mocker.patch(
        "apps.dataset.services.dataset_service.validate_csv_against_schema",
        side_effect=ValueError("CSV読み込み失敗"),
    )

    source_file = io.BytesIO(b"dummy")
    source_file.name = "test.csv"

    schema = {"time": "time", "metrics": ["metric1"]}

    with pytest.raises(ValidationError, match="CSV読み込み失敗"):
        create_dataset(
            owner=user,
            name="Test Dataset",
            source_file=source_file,
            schema=schema,
        )
