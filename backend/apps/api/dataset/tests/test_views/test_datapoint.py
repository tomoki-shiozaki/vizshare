import pytest
from django.urls import reverse
from rest_framework import status

# ------------------------
# Tests
# ------------------------


@pytest.mark.django_db
def test_dataset_data_api_returns_structured_data(
    api_client, user, dataset_with_points
):
    api_client.force_authenticate(user=user)

    url = reverse("dataset:datapoints", args=[dataset_with_points.id])
    res = api_client.get(url)

    assert res.status_code == status.HTTP_200_OK
    assert res.data == {
        "A": [{"time": "2026-03-13T00:00:00Z", "value": 1, "anomaly": 0.1}],
        "B": [{"time": "2026-03-13T01:00:00Z", "value": 2}],
    }


@pytest.mark.django_db
def test_dataset_data_api_returns_404_for_other_users(
    api_client, another_user, dataset_with_points
):
    api_client.force_authenticate(user=another_user)

    url = reverse("dataset:datapoints", args=[dataset_with_points.id])
    res = api_client.get(url)

    assert res.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_dataset_data_api_empty_dataset(api_client, user, dataset):
    api_client.force_authenticate(user=user)

    url = reverse("dataset:datapoints", args=[dataset.id])
    res = api_client.get(url)

    assert res.status_code == status.HTTP_200_OK
    assert res.data == {}  # データポイントがない場合は空 dict
