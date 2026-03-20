from os.path import basename
from typing import Any, Dict, cast

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory

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
            is_public=True,
        )

        # RequestFactory で擬似 request を作る
        request = RequestFactory().get("/")
        serializer = PublicDatasetDetailSerializer(
            dataset, context={"request": request}
        )

        data = cast(Dict[str, Any], serializer.data)

        # owner が正しくシリアライズされる
        assert data["owner"] == user.username

        # download_url が絶対 URL になっている
        assert data["download_url"].startswith("http://")
        assert basename(data["download_url"]).startswith("test")
        assert basename(data["download_url"]).endswith(".csv")

    def test_download_url_none_when_no_file(self, user):
        dataset = Dataset.objects.create(
            owner=user,
            name="no file dataset",
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            is_public=True,
        )

        request = RequestFactory().get("/")
        serializer = PublicDatasetDetailSerializer(
            dataset, context={"request": request}
        )
        data = cast(Dict[str, Any], serializer.data)

        assert data["download_url"] is None

    def test_download_url_none_when_no_request(self, user):
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")
        dataset = Dataset.objects.create(
            owner=user,
            name="dataset no request",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            is_public=True,
        )

        # context に request を渡さない場合
        serializer = PublicDatasetDetailSerializer(dataset, context={})
        data = cast(Dict[str, Any], serializer.data)

        assert data["download_url"] is None
