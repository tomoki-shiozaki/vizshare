import json
import uuid

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME
from apps.dataset.models import Dataset


@pytest.mark.django_db
class TestDatasetCreateAPIView:
    def test_dataset_upload_api_success(self, mocker, user, api_client: APIClient):
        # APIClient にログインユーザーを設定
        api_client.force_authenticate(user=user)

        # 非同期ジョブ呼び出しをモック
        mock_enqueue = mocker.patch(
            "apps.dataset.services.application.build_dataset.enqueue_parse_dataset"
        )
        mock_validate = mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema"
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
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema",
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
            visibility=Dataset.Visibility.PRIVATE,
        )
        url = reverse("dataset:visibility", args=[dataset.pk])

        response = api_client.patch(
            url, {"visibility": Dataset.Visibility.PUBLIC}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK  # type: ignore
        dataset.refresh_from_db()
        assert dataset.visibility == Dataset.Visibility.PUBLIC

    def test_visibility_update_permission_denied(
        self, user, another_user, api_client: APIClient
    ):
        # 他ユーザーの dataset を作る
        other_user_dataset = Dataset.objects.create(
            name="Other Dataset",
            owner=another_user,
            schema={"time": "time_col", "metrics": ["value"]},
            visibility=Dataset.Visibility.PRIVATE,
        )
        api_client.force_authenticate(user=user)
        url = reverse("dataset:visibility", args=[other_user_dataset.pk])

        response = api_client.patch(
            url, {"visibility": Dataset.Visibility.PUBLIC}, format="json"
        )
        assert (
            response.status_code == status.HTTP_404_NOT_FOUND  # type: ignore
        )  # queryset に入らないため


@pytest.mark.django_db
class TestDatasetAnonymousCreateAPIView:
    @pytest.fixture(autouse=True)
    def disable_throttle(self, mocker):
        mocker.patch(
            "apps.api.dataset.views.dataset_write.AnonymousUploadThrottle.allow_request",
            return_value=True,
        )

    def test_anonymous_dataset_upload_success(
        self,
        mocker,
        api_client: APIClient,
    ):
        mock_enqueue = mocker.patch(
            "apps.dataset.services.application.build_dataset.enqueue_parse_dataset"
        )

        mock_validate = mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema"
        )

        csv_file = ContentFile(
            b"time,metric1\n1,10\n",
            name="test.csv",
        )

        data = {
            "name": "Anonymous Dataset",
            "source_file": csv_file,
            "schema": json.dumps(
                {
                    "time": "time",
                    "metrics": ["metric1"],
                }
            ),
        }

        url = reverse("dataset:anonymous-create")

        response = api_client.post(url, data, format="multipart")

        assert response.status_code == status.HTTP_201_CREATED  # type: ignore

        dataset_public_id = response.data["public_id"]  # type: ignore
        dataset = Dataset.objects.get(public_id=dataset_public_id)

        assert dataset.owner is None
        assert dataset.anonymous_id is not None
        assert dataset.name == "Anonymous Dataset"

        # cookie がセットされる
        assert ANONYMOUS_ID_COOKIE_NAME in response.cookies  # type: ignore

        cookie = response.cookies[ANONYMOUS_ID_COOKIE_NAME]  # type: ignore

        assert cookie.value == str(dataset.anonymous_id)

        mock_validate.assert_called_once()
        mock_enqueue.assert_called_once_with(dataset.id)  # type: ignore

    def test_anonymous_dataset_upload_reuses_cookie(
        self,
        mocker,
        api_client: APIClient,
    ):
        mocker.patch(
            "apps.dataset.services.application.build_dataset.enqueue_parse_dataset"
        )

        mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema"
        )

        existing_id = str(uuid.uuid4())

        api_client.cookies[ANONYMOUS_ID_COOKIE_NAME] = existing_id

        csv_file = ContentFile(
            b"time,metric1\n1,10\n",
            name="test.csv",
        )

        data = {
            "name": "Anonymous Dataset",
            "source_file": csv_file,
            "schema": json.dumps(
                {
                    "time": "time",
                    "metrics": ["metric1"],
                }
            ),
        }

        url = reverse("dataset:anonymous-create")

        response = api_client.post(url, data, format="multipart")

        assert response.status_code == status.HTTP_201_CREATED  # type: ignore

        dataset_public_id = response.data["public_id"]  # type: ignore
        dataset = Dataset.objects.get(public_id=dataset_public_id)

        assert str(dataset.anonymous_id) == existing_id

        # 既存 cookie の場合は再設定しない
        assert ANONYMOUS_ID_COOKIE_NAME not in response.cookies  # type: ignore

    def test_anonymous_dataset_upload_validation_error(
        self,
        mocker,
        api_client: APIClient,
    ):
        mocker.patch(
            "apps.dataset.services.application.build_dataset.validate_csv_against_schema",
            side_effect=ValueError("CSV読み込み失敗"),
        )

        csv_file = ContentFile(
            b"dummy",
            name="bad.csv",
        )

        data = {
            "name": "Bad Dataset",
            "source_file": csv_file,
            "schema": json.dumps(
                {
                    "time": "time",
                    "metrics": ["metric1"],
                }
            ),
        }

        url = reverse("dataset:anonymous-create")

        response = api_client.post(url, data, format="multipart")

        assert response.status_code == status.HTTP_400_BAD_REQUEST  # type: ignore

        assert "CSV読み込み失敗" in str(response.data)  # type: ignore
