import uuid

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse

from apps.dataset.models import Dataset


@pytest.mark.django_db
class TestAnonymousDatasetListAPIView:
    def test_returns_only_current_anonymous_user_datasets(
        self,
        anonymous_api_client,
        anonymous_dataset,
        another_anonymous_dataset,
    ):
        url = reverse("dataset:anonymous-list")

        response = anonymous_api_client.get(url)

        assert response.status_code == 200
        assert response.data["count"] == 1

        returned_dataset = response.data["results"][0]

        assert returned_dataset["public_id"] == str(anonymous_dataset.public_id)
        assert returned_dataset["name"] == anonymous_dataset.name

    def test_returns_empty_list_without_cookie(
        self,
        api_client,
        anonymous_dataset,
    ):
        url = reverse("dataset:anonymous-list")

        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data["count"] == 0
        assert response.data["results"] == []

    def test_returns_empty_list_when_no_matching_anonymous_id(
        self,
        anonymous_api_client,
        another_anonymous_dataset,
    ):
        url = reverse("dataset:anonymous-list")

        response = anonymous_api_client.get(url)

        assert response.status_code == 200
        assert response.data["count"] == 0
        assert response.data["results"] == []

    def test_returns_datasets_ordered_by_created_at_desc(
        self,
        anonymous_api_client,
        anonymous_id,
    ):
        older_dataset = Dataset.objects.create(
            name="Older Dataset",
            anonymous_id=anonymous_id,
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        newer_dataset = Dataset.objects.create(
            name="Newer Dataset",
            anonymous_id=anonymous_id,
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        url = reverse("dataset:anonymous-list")

        response = anonymous_api_client.get(url)

        assert response.status_code == 200

        results = response.data["results"]

        assert results[0]["public_id"] == str(newer_dataset.public_id)
        assert results[1]["public_id"] == str(older_dataset.public_id)


@pytest.mark.django_db
class TestAnonymousDatasetDetailAPIView:
    def test_anonymous_dataset_detail_success(self, api_client):
        anonymous_id = uuid.uuid4()

        dataset = Dataset.objects.create(
            name="Anonymous Dataset",
            anonymous_id=anonymous_id,
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        api_client.cookies["anonymous_id"] = str(anonymous_id)

        url = reverse(
            "dataset:anonymous-detail",
            kwargs={"public_id": dataset.public_id},
        )

        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data["public_id"] == str(dataset.public_id)
        assert response.data["name"] == "Anonymous Dataset"

    def test_without_cookie_returns_404(self, api_client):
        dataset = Dataset.objects.create(
            name="Anonymous Dataset",
            anonymous_id=uuid.uuid4(),
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        url = reverse(
            "dataset:anonymous-detail",
            kwargs={"public_id": dataset.public_id},
        )

        response = api_client.get(url)

        assert response.status_code == 404

    def test_other_anonymous_cookie_returns_404(self, api_client):
        dataset = Dataset.objects.create(
            name="Anonymous Dataset",
            anonymous_id=uuid.uuid4(),
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        api_client.cookies["anonymous_id"] = str(uuid.uuid4())

        url = reverse(
            "dataset:anonymous-detail",
            kwargs={"public_id": dataset.public_id},
        )

        response = api_client.get(url)

        assert response.status_code == 404

    def test_nonexistent_dataset_returns_404(self, api_client):
        api_client.cookies["anonymous_id"] = str(uuid.uuid4())

        url = reverse(
            "dataset:anonymous-detail",
            kwargs={"public_id": uuid.uuid4()},
        )

        response = api_client.get(url)

        assert response.status_code == 404


@pytest.mark.django_db
class TestPublicDatasetReadAPI:
    def test_public_dataset_list_only_returns_public_parsed(self, api_client, user):
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

        # ✅ 公開 & parsed（表示される）
        Dataset.objects.create(
            owner=user,
            name="public parsed",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PUBLIC,
        )

        # ❌ 非公開
        Dataset.objects.create(
            owner=user,
            name="private parsed",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PRIVATE,
        )

        # ❌ 公開だがprocessing
        Dataset.objects.create(
            owner=user,
            name="public processing",
            source_file=dummy_file,
            status=Dataset.Status.PROCESSING,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PUBLIC,
        )

        response = api_client.get(reverse("dataset:public"))

        assert response.status_code == 200
        assert response.data["count"] == 1

        result = response.data["results"][0]
        assert result["name"] == "public parsed"
        assert result["owner"] == "testuser"

    def test_public_dataset_list_allow_any(self, api_client):
        response = api_client.get(reverse("dataset:public"))

        assert response.status_code == 200


@pytest.mark.django_db
class TestPublicDatasetDetailAPIView:
    def test_can_retrieve_public_parsed_dataset(self, api_client, user):
        # ダミーファイル作成
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

        # 公開かつ解析済みのデータセット（取得される）
        dataset = Dataset.objects.create(
            owner=user,
            name="public parsed dataset",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PUBLIC,
        )

        url = reverse("dataset:public-detail", args=[dataset.pk])
        response = api_client.get(url)

        assert response.status_code == 200
        data = response.data
        assert data["id"] == dataset.pk
        assert data["name"] == dataset.name
        assert data["owner"] == user.username

    def test_cannot_retrieve_non_public_dataset(self, api_client, user):
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

        # 非公開のデータセット（取得不可）
        dataset = Dataset.objects.create(
            owner=user,
            name="private dataset",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PRIVATE,
        )

        url = reverse("dataset:public-detail", args=[dataset.pk])
        response = api_client.get(url)

        assert response.status_code == 404

    def test_cannot_retrieve_processing_dataset(self, api_client, user):
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

        # 公開だが解析中のデータセット（取得不可）
        dataset = Dataset.objects.create(
            owner=user,
            name="public processing dataset",
            source_file=dummy_file,
            status=Dataset.Status.PROCESSING,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PUBLIC,
        )

        url = reverse("dataset:public-detail", args=[dataset.pk])
        response = api_client.get(url)

        assert response.status_code == 404


@pytest.mark.django_db
class TestPublicDatasetDownloadAPIView:
    @override_settings(IS_PRODUCTION=False)
    def test_redirects_to_download_url_for_public_parsed_dataset(
        self, api_client, user
    ):
        # ダミーファイル作成
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

        # 公開かつ解析済みのデータセット
        dataset = Dataset.objects.create(
            owner=user,
            name="public parsed dataset",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PUBLIC,
        )

        url = reverse("dataset:public-download", args=[dataset.pk])
        response = api_client.get(url)

        # リダイレクトされることを確認
        assert response.status_code == 302
        assert response.url == dataset.get_download_url()

    def test_returns_404_for_non_public_dataset(self, api_client, user):
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

        # 非公開データセット
        dataset = Dataset.objects.create(
            owner=user,
            name="private dataset",
            source_file=dummy_file,
            status=Dataset.Status.PARSED,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PRIVATE,
        )

        url = reverse("dataset:public-download", args=[dataset.pk])
        response = api_client.get(url)
        assert response.status_code == 404

    def test_returns_404_for_processing_dataset(self, api_client, user):
        dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

        # 解析中のデータセット
        dataset = Dataset.objects.create(
            owner=user,
            name="processing dataset",
            source_file=dummy_file,
            status=Dataset.Status.PROCESSING,
            schema={"time": "year", "metrics": ["value"]},
            visibility=Dataset.Visibility.PUBLIC,
        )

        url = reverse("dataset:public-download", args=[dataset.pk])
        response = api_client.get(url)
        assert response.status_code == 404
