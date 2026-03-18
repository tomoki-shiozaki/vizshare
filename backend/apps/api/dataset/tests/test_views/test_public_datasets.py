import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from apps.dataset.models import Dataset


@pytest.mark.django_db
def test_public_dataset_list_only_returns_public_parsed(api_client, user):
    dummy_file = SimpleUploadedFile("test.csv", b"col1,col2\n1,2")

    # ✅ 公開 & parsed（表示される）
    Dataset.objects.create(
        owner=user,
        name="public parsed",
        source_file=dummy_file,
        status=Dataset.Status.PARSED,
        schema={"time": "year", "metrics": ["value"]},
        is_public=True,
    )

    # ❌ 非公開
    Dataset.objects.create(
        owner=user,
        name="private parsed",
        source_file=dummy_file,
        status=Dataset.Status.PARSED,
        schema={"time": "year", "metrics": ["value"]},
        is_public=False,
    )

    # ❌ 公開だがprocessing
    Dataset.objects.create(
        owner=user,
        name="public processing",
        source_file=dummy_file,
        status=Dataset.Status.PROCESSING,
        schema={"time": "year", "metrics": ["value"]},
        is_public=True,
    )

    response = api_client.get(reverse("dataset:public-list"))

    assert response.status_code == 200
    assert response.data["count"] == 1

    result = response.data["results"][0]
    assert result["name"] == "public parsed"
    assert result["owner"] == "testuser"


@pytest.mark.django_db
def test_public_dataset_list_allow_any(api_client):
    response = api_client.get(reverse("dataset:public-list"))

    assert response.status_code == 200
