import uuid

import pytest
from django.core.files.base import ContentFile
from rest_framework.exceptions import ValidationError

from apps.dataset.models import Dataset
from apps.dataset.services.application.build_dataset import create_dataset


@pytest.mark.django_db
class TestCreateDatasetService:
    @pytest.fixture
    def source_file(self):
        return ContentFile(
            b"time,metric1\n1,10\n",
            name="test.csv",
        )

    @pytest.fixture
    def schema(self):
        return {
            "time": "time",
            "metrics": ["metric1"],
        }

    def test_create_dataset_success(
        self,
        mocker,
        user,
        source_file,
        schema,
    ):
        mock_validate = mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema"
        )

        mock_enqueue = mocker.patch(
            "apps.dataset.services.application.build_dataset.enqueue_parse_dataset"
        )

        dataset = create_dataset(
            owner=user,
            name="Test Dataset",
            source_file=source_file,
            schema=schema,
        )

        assert Dataset.objects.filter(pk=dataset.pk).exists()

        assert dataset.owner == user
        assert dataset.anonymous_id is None
        assert dataset.name == "Test Dataset"

        mock_validate.assert_called_once_with(source_file, schema)

        mock_enqueue.assert_called_once_with(dataset.id)  # type: ignore

    def test_create_dataset_with_anonymous_id(
        self,
        mocker,
        source_file,
        schema,
    ):
        mock_validate = mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema"
        )

        mock_enqueue = mocker.patch(
            "apps.dataset.services.application.build_dataset.enqueue_parse_dataset"
        )

        anonymous_id = uuid.uuid4()

        dataset = create_dataset(
            anonymous_id=anonymous_id,
            name="Anonymous Dataset",
            source_file=source_file,
            schema=schema,
        )

        assert Dataset.objects.filter(pk=dataset.pk).exists()

        assert dataset.owner is None
        assert dataset.anonymous_id == anonymous_id
        assert dataset.name == "Anonymous Dataset"

        mock_validate.assert_called_once_with(source_file, schema)

        mock_enqueue.assert_called_once_with(dataset.id)  # type: ignore

    def test_create_dataset_validation_error(
        self,
        mocker,
        user,
        schema,
    ):
        mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema",
            side_effect=ValueError("CSV読み込み失敗"),
        )

        source_file = ContentFile(
            b"dummy",
            name="bad.csv",
        )

        with pytest.raises(ValidationError, match="CSV読み込み失敗"):
            create_dataset(
                owner=user,
                name="Bad Dataset",
                source_file=source_file,
                schema=schema,
            )

    def test_create_dataset_requires_exactly_one_identity(
        self,
        mocker,
        user,
        source_file,
        schema,
    ):
        mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema"
        )

        error_message = "Exactly one of owner or anonymous_id must be provided."

        # owner も anonymous_id も無い
        with pytest.raises(
            ValidationError,
            match=error_message,
        ):
            create_dataset(
                name="Invalid Dataset",
                source_file=source_file,
                schema=schema,
            )

        # owner と anonymous_id の両方がある
        with pytest.raises(
            ValidationError,
            match=error_message,
        ):
            create_dataset(
                owner=user,
                anonymous_id=uuid.uuid4(),
                name="Invalid Dataset",
                source_file=source_file,
                schema=schema,
            )
