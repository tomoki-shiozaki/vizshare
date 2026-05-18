import pytest
from django.urls import reverse
from rest_framework import status

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME
from apps.dataset.models import DataPoint, Dataset
from apps.dataset.services.ingestion.csv_parser import parse_row_time


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


@pytest.mark.django_db
class TestDatasetEntityComparisonAPIView:
    def test_get_success(self, api_client, user, dataset):
        api_client.force_authenticate(user=user)

        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=1,
            order_index=0,
        )
        DataPoint.objects.create(
            dataset=dataset,
            entity="B",
            metric="value",
            raw_time="2026-03-13T01:00:00Z",
            time=parse_row_time("2026-03-13T01:00:00Z"),
            value=2,
            order_index=0,
        )

        url = reverse("dataset:timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 200
        assert res.data == [
            {"time": "2026-03-13T00:00:00Z", "A": 1.0},
            {"time": "2026-03-13T01:00:00Z", "B": 2.0},
        ]

    def test_metric_required(self, api_client, user, dataset):
        api_client.force_authenticate(user=user)

        url = reverse("dataset:timeseries-entity", args=[dataset.id])
        res = api_client.get(url)

        assert res.status_code == 400
        assert res.data["detail"] == "metric is required"

    def test_only_owner_can_access(self, api_client, another_user, dataset):
        api_client.force_authenticate(user=another_user)

        url = reverse("dataset:timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 404

    def test_empty_result(self, api_client, user, dataset):
        api_client.force_authenticate(user=user)

        url = reverse("dataset:timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 200
        assert res.data == []

    def test_metric_filtering(self, api_client, user, dataset):
        api_client.force_authenticate(user=user)

        # value（対象）
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=1,
            order_index=0,
        )

        # anomaly（対象外）
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="anomaly",
            raw_time="2026-03-13T00:00:01Z",
            time=parse_row_time("2026-03-13T00:00:01Z"),
            value=0.1,
            order_index=1,
        )

        url = reverse("dataset:timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 200
        assert res.data == [
            {"time": "2026-03-13T00:00:00Z", "A": 1.0},
        ]


@pytest.mark.django_db
class TestDatasetMetaAPIView:
    def test_get_dataset_meta_success(
        self,
        api_client,
        user,
        dataset_with_points,
    ):
        api_client.force_authenticate(user=user)

        url = reverse("dataset:meta", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == 200
        assert res.data["entities"] == ["A", "B"]
        assert res.data["metrics"] == ["anomaly", "value"]

    def test_get_dataset_meta_only_owner_can_access(
        self,
        api_client,
        another_user,
        dataset_with_points,
    ):
        api_client.force_authenticate(user=another_user)

        url = reverse("dataset:meta", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == 404

    def test_get_dataset_meta_distinct_behavior(
        self,
        api_client,
        user,
        dataset_with_points,
    ):
        api_client.force_authenticate(user=user)

        # duplicate insert
        dataset = dataset_with_points
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T02:00:00Z",
            value=3,
            order_index=2,
        )

        url = reverse("dataset:meta", args=[dataset.id])
        res = api_client.get(url)

        assert res.status_code == 200
        assert res.data["entities"] == ["A", "B"]
        assert set(res.data["metrics"]) == {"anomaly", "value"}

    def test_get_dataset_meta_empty(
        self,
        api_client,
        user,
        dataset,
    ):
        api_client.force_authenticate(user=user)

        url = reverse("dataset:meta", args=[dataset.id])
        res = api_client.get(url)

        assert res.status_code == 200
        assert res.data["entities"] == []
        assert res.data["metrics"] == []


@pytest.mark.django_db
class TestAnonymousDatasetTimeSeriesAPIView:

    def test_returns_structured_data(
        self,
        anonymous_api_client,
        anonymous_dataset,
    ):

        DataPoint.objects.create(
            dataset=anonymous_dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=1,
            order_index=0,
        )

        DataPoint.objects.create(
            dataset=anonymous_dataset,
            entity="A",
            metric="anomaly",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=0.1,
            order_index=1,
        )

        DataPoint.objects.create(
            dataset=anonymous_dataset,
            entity="B",
            metric="value",
            raw_time="2026-03-13T01:00:00Z",
            time=parse_row_time("2026-03-13T01:00:00Z"),
            value=2,
            order_index=0,
        )

        url = reverse(
            "dataset:anonymous-timeseries",
            kwargs={"public_id": anonymous_dataset.public_id},
        )

        res = anonymous_api_client.get(url)

        assert res.status_code == 200

    def test_returns_404_for_other_anonymous_user(
        self,
        anonymous_api_client,
        another_anonymous_dataset,
    ):
        """他のanonymousユーザーはアクセス不可"""

        url = reverse(
            "dataset:anonymous-timeseries",
            kwargs={"public_id": another_anonymous_dataset.public_id},
        )

        res = anonymous_api_client.get(url)

        assert res.status_code == status.HTTP_404_NOT_FOUND

    def test_empty_dataset_returns_empty_dict(
        self,
        anonymous_api_client,
        anonymous_dataset,
    ):
        """データがない場合は空dict"""

        url = reverse(
            "dataset:anonymous-timeseries",
            kwargs={"public_id": anonymous_dataset.public_id},
        )

        res = anonymous_api_client.get(url)

        assert res.status_code == status.HTTP_200_OK
        assert res.data == {}

    def test_missing_cookie_returns_403(
        self,
        api_client,
        anonymous_dataset,
    ):
        """cookieなしは拒否"""

        url = reverse(
            "dataset:anonymous-timeseries",
            kwargs={"public_id": anonymous_dataset.public_id},
        )

        res = api_client.get(url)

        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_invalid_cookie_returns_403(
        self,
        api_client,
        anonymous_dataset,
    ):
        """不正UUID cookieは拒否"""

        api_client.cookies[ANONYMOUS_ID_COOKIE_NAME] = "invalid-uuid"

        url = reverse(
            "dataset:anonymous-timeseries",
            kwargs={"public_id": anonymous_dataset.public_id},
        )

        res = api_client.get(url)

        assert res.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestPublicDatasetTimeSeriesAPIView:
    def test_returns_structured_data(self, api_client, user):
        """公開かつ解析済みの Dataset の時系列が取得できる"""
        dataset = Dataset.objects.create(
            owner=user,
            name="public parsed dataset",
            status=Dataset.Status.PARSED,
            visibility=Dataset.Visibility.PUBLIC,
            schema={"time": "time_col", "metrics": ["value"]},
        )
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            value=1,
            order_index=0,
        )
        url = reverse("dataset:public-timeseries", args=[dataset.pk])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_200_OK
        assert "A" in res.data

    def test_returns_404_for_non_public_dataset(self, api_client, user):
        """非公開 Dataset は取得不可"""
        dataset = Dataset.objects.create(
            owner=user,
            name="private dataset",
            status=Dataset.Status.PARSED,
            visibility=Dataset.Visibility.PRIVATE,
            schema={"time": "time_col", "metrics": ["value"]},
        )
        url = reverse("dataset:public-timeseries", args=[dataset.pk])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_404_NOT_FOUND

    def test_returns_404_for_processing_dataset(self, api_client, user):
        """解析中の Dataset は取得不可"""
        dataset = Dataset.objects.create(
            owner=user,
            name="processing dataset",
            status=Dataset.Status.PROCESSING,
            visibility=Dataset.Visibility.PUBLIC,
            schema={"time": "time_col", "metrics": ["value"]},
        )
        url = reverse("dataset:public-timeseries", args=[dataset.pk])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestPublicDatasetEntityComparisonAPIView:
    def test_get_success(self, api_client, dataset):
        dataset.visibility = Dataset.Visibility.PUBLIC
        dataset.status = Dataset.Status.PARSED
        dataset.save()

        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=1,
            order_index=0,
        )
        DataPoint.objects.create(
            dataset=dataset,
            entity="B",
            metric="value",
            raw_time="2026-03-13T01:00:00Z",
            time=parse_row_time("2026-03-13T01:00:00Z"),
            value=2,
            order_index=0,
        )

        url = reverse("dataset:public-timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 200
        assert res.data == [
            {"time": "2026-03-13T00:00:00Z", "A": 1.0},
            {"time": "2026-03-13T01:00:00Z", "B": 2.0},
        ]

    def test_metric_required(self, api_client, dataset):
        dataset.visibility = Dataset.Visibility.PUBLIC
        dataset.status = Dataset.Status.PARSED
        dataset.save()

        url = reverse("dataset:public-timeseries-entity", args=[dataset.id])
        res = api_client.get(url)

        assert res.status_code == 400
        assert res.data["detail"] == "metric is required"

    def test_non_public_dataset(self, api_client, dataset):
        dataset.visibility = Dataset.Visibility.PRIVATE
        dataset.status = Dataset.Status.PARSED
        dataset.save()

        url = reverse("dataset:public-timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 404

    def test_not_parsed_dataset(self, api_client, dataset):
        dataset.visibility = Dataset.Visibility.PUBLIC
        dataset.status = Dataset.Status.PROCESSING  # PARSED以外
        dataset.save()

        url = reverse("dataset:public-timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 404

    def test_empty_result(self, api_client, dataset):
        dataset.visibility = Dataset.Visibility.PUBLIC
        dataset.status = Dataset.Status.PARSED
        dataset.save()

        url = reverse("dataset:public-timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 200
        assert res.data == []

    def test_metric_filtering(self, api_client, dataset):
        dataset.visibility = Dataset.Visibility.PUBLIC
        dataset.status = Dataset.Status.PARSED
        dataset.save()

        # 対象
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=1,
            order_index=0,
        )

        # 対象外
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="anomaly",
            raw_time="2026-03-13T00:00:01Z",
            time=parse_row_time("2026-03-13T00:00:01Z"),
            value=0.1,
            order_index=1,
        )

        url = reverse("dataset:public-timeseries-entity", args=[dataset.id])
        res = api_client.get(url, {"metric": "value"})

        assert res.status_code == 200
        assert res.data == [
            {"time": "2026-03-13T00:00:00Z", "A": 1.0},
        ]


@pytest.mark.django_db
class TestPublicDatasetMetaAPIView:
    def test_get_public_dataset_meta_success(
        self,
        api_client,
        dataset_with_points,
    ):
        dataset_with_points.visibility = Dataset.Visibility.PUBLIC
        dataset_with_points.status = Dataset.Status.PARSED
        dataset_with_points.save()

        url = reverse("dataset:public-meta", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_200_OK
        assert res.data["entities"] == ["A", "B"]
        assert res.data["metrics"] == ["anomaly", "value"]

    def test_get_public_dataset_meta_no_auth_required(
        self,
        api_client,
        dataset_with_points,
    ):
        dataset_with_points.visibility = Dataset.Visibility.PUBLIC
        dataset_with_points.status = Dataset.Status.PARSED
        dataset_with_points.save()

        url = reverse("dataset:public-meta", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_200_OK

    def test_get_public_dataset_meta_not_public(
        self,
        api_client,
        dataset_with_points,
    ):
        dataset_with_points.visibility = Dataset.Visibility.PRIVATE
        dataset_with_points.status = Dataset.Status.PARSED
        dataset_with_points.save()

        url = reverse("dataset:public-meta", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_404_NOT_FOUND

    def test_get_public_dataset_meta_not_parsed(
        self,
        api_client,
        dataset_with_points,
    ):
        dataset_with_points.visibility = Dataset.Visibility.PUBLIC
        dataset_with_points.status = Dataset.Status.UPLOADED
        dataset_with_points.save()

        url = reverse("dataset:public-meta", args=[dataset_with_points.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_404_NOT_FOUND

    def test_get_public_dataset_meta_distinct_behavior(
        self,
        api_client,
        dataset_with_points,
    ):
        dataset = dataset_with_points
        dataset.visibility = Dataset.Visibility.PUBLIC
        dataset.status = Dataset.Status.PARSED
        dataset.save()

        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T02:00:00Z",
            value=3,
            order_index=2,
        )

        url = reverse("dataset:public-meta", args=[dataset.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_200_OK
        assert res.data["entities"] == ["A", "B"]
        assert set(res.data["metrics"]) == {"anomaly", "value"}

    def test_get_public_dataset_meta_empty(
        self,
        api_client,
        dataset,
    ):
        dataset.visibility = Dataset.Visibility.PUBLIC
        dataset.status = Dataset.Status.PARSED
        dataset.save()

        url = reverse("dataset:public-meta", args=[dataset.id])
        res = api_client.get(url)

        assert res.status_code == status.HTTP_200_OK
        assert res.data["entities"] == []
        assert res.data["metrics"] == []
