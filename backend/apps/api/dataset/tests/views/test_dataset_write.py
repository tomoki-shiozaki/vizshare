import json

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.dataset.models import Dataset


@pytest.mark.django_db
class TestDatasetCreateAPIView:
    def test_dataset_upload_api_success(self, mocker, user, api_client: APIClient):
        # APIClient にログインユーザーを設定
        api_client.force_authenticate(user=user)

        # 非同期ジョブ呼び出しをモック
        mock_enqueue = mocker.patch(
            "apps.dataset.services.dataset_service.enqueue_parse_dataset"
        )
        mock_validate = mocker.patch(
            "apps.dataset.services.dataset_service.validate_csv_against_schema"
        )

        # アップロードする CSV
        csv_file = ContentFile(b"time,metric1\n1,10\n", name="test.csv")

        data = {
            "name": "Test Dataset API",
            "source_file": csv_file,
            "schema": json.dumps({"time": "time", "metrics": ["metric1"]}),
        }

        url = reverse("dataset:create")
        response = api_client.post(url, data, format="multipart")

        assert response.status_code == status.HTTP_201_CREATED  # type: ignore
        dataset_id = response.data["id"]  # type: ignore
        dataset = Dataset.objects.get(pk=dataset_id)
        assert dataset.owner == user
        assert dataset.name == "Test Dataset API"

        mock_validate.assert_called_once()
        mock_enqueue.assert_called_once_with(dataset.id)  # type: ignore

    def test_dataset_upload_api_validation_error(
        self, mocker, user, api_client: APIClient
    ):
        api_client.force_authenticate(user=user)

        # CSV バリデーションが ValueError を出すようにモック
        mocker.patch(
            "apps.dataset.services.dataset_service.validate_csv_against_schema",
            side_effect=ValueError("CSV読み込み失敗"),
        )

        csv_file = ContentFile(b"dummy", name="bad.csv")

        data = {
            "name": "Bad Dataset",
            "source_file": csv_file,
            "schema": json.dumps(
                {"time": "time", "metrics": ["metric1"]}
            ),  # <- dict → JSON文字列
        }

        url = reverse("dataset:create")
        response = api_client.post(url, data, format="multipart")

        assert response.status_code == status.HTTP_400_BAD_REQUEST  # type: ignore
        assert "CSV読み込み失敗" in str(response.data)  # type: ignore


@pytest.mark.django_db
class TestDatasetVisibilityUpdateAPIView:
    def test_visibility_update_success(self, user, api_client: APIClient):
        api_client.force_authenticate(user=user)
        dataset = Dataset.objects.create(
            name="My Dataset",
            owner=user,
            schema={"time": "time_col", "metrics": ["value"]},
            is_public=False,
        )
        url = reverse("dataset:visibility", args=[dataset.pk])

        response = api_client.patch(url, {"is_public": True}, format="json")
        assert response.status_code == status.HTTP_200_OK  # type: ignore
        dataset.refresh_from_db()
        assert dataset.is_public is True

    def test_visibility_update_permission_denied(
        self, user, another_user, api_client: APIClient
    ):
        # 他ユーザーの dataset を作る
        other_user_dataset = Dataset.objects.create(
            name="Other Dataset",
            owner=another_user,
            schema={"time": "time_col", "metrics": ["value"]},
            is_public=False,
        )
        api_client.force_authenticate(user=user)
        url = reverse("dataset:visibility", args=[other_user_dataset.pk])

        response = api_client.patch(url, {"is_public": True}, format="json")
        assert (
            response.status_code == status.HTTP_404_NOT_FOUND  # type: ignore
        )  # queryset に入らないため
