from typing import Any, Dict, cast

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.api.dataset.serializers.dataset_read import PublicDatasetDetailSerializer
from apps.dataset.models import Dataset


@pytest.mark.django_db
class TestPublicDatasetDetailSerializer:
    def test_serializes_owner_and_download_url(self, user):
        # ダミーファイル作成
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")
        dataset = Dataset.objects.create(
            owner=user,
            name="public dataset",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PUBLIC,
        )

        serializer = PublicDatasetDetailSerializer(dataset)

        data = cast(Dict[str, Any], serializer.data)

        assert data["id"] == dataset.pk
        assert data["name"] == dataset.name
        assert data["owner"] == user.username
        assert "created_at" in data
