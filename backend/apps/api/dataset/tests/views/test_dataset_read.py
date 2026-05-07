import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse

from apps.dataset.models import Dataset


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
