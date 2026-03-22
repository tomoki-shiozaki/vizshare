import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestDatasetTimeSeriesAPIView:
    def test_returns_structured_data(self, api_client, user, dataset_with_points):
        """正しいユーザーがアクセスした場合にデータが返る"""
        api_client.force_authenticate(user=user)
        url = reverse("dataset:timeseries", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_200_OK
        assert res.data == {
            "A": [{"time": "2026-03-13T00:00:00Z", "value": 1, "anomaly": 0.1}],
            "B": [{"time": "2026-03-13T01:00:00Z", "value": 2}],
        }

    def test_returns_404_for_other_users(
        self, api_client, another_user, dataset_with_points
    ):
        """他のユーザーがアクセスした場合は404"""
        api_client.force_authenticate(user=another_user)
        url = reverse("dataset:timeseries", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_404_NOT_FOUND

    def test_empty_dataset_returns_empty_dict(self, api_client, user, dataset):
        """データポイントがない場合は空 dict を返す"""
        api_client.force_authenticate(user=user)
        url = reverse("dataset:timeseries", args=[dataset.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_200_OK
        assert res.data == {}
