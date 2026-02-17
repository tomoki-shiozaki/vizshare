import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from apps.dataset.models import DataPoint, Dataset

User = get_user_model()


# ----------------------------
# Fixtures
# ----------------------------


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="password",
    )


@pytest.fixture
def dataset(db, user):
    return Dataset.objects.create(
        owner=user,
        name="test dataset",
        source_file="dummy.csv",
        schema={"time": "Year", "metrics": ["value"]},
    )


# ============================
# Dataset Tests
# ============================


@pytest.mark.django_db
class TestDatasetModel:

    def test_mark_processing_from_uploaded(self, dataset):
        """UPLOADED → PROCESSING へ遷移できる"""
        result = dataset.mark_processing()

        dataset.refresh_from_db()
        assert result is True
        assert dataset.status == Dataset.Status.PROCESSING

    def test_mark_processing_returns_false_if_not_uploaded(self, dataset):
        """UPLOADED 以外なら処理開始できない"""
        dataset.status = Dataset.Status.PROCESSING
        dataset.save()

        result = dataset.mark_processing()

        dataset.refresh_from_db()
        assert result is False
        assert dataset.status == Dataset.Status.PROCESSING

    def test_mark_parsed_sets_status_and_result(self, dataset):
        """解析完了状態に変更され結果が保存される"""
        result_data = {"rows": 10}

        dataset.status = Dataset.Status.PROCESSING
        dataset.save()

        dataset.mark_parsed(result_data)
        dataset.refresh_from_db()

        assert dataset.status == Dataset.Status.PARSED
        assert dataset.parse_result == result_data

    def test_mark_parsed_without_result(self, dataset):
        """result=None の場合でも状態だけ更新される"""
        dataset.status = Dataset.Status.PROCESSING
        dataset.save()

        dataset.mark_parsed()
        dataset.refresh_from_db()

        assert dataset.status == Dataset.Status.PARSED
        assert dataset.parse_result is None

    def test_mark_parsed_invalid_state(self, dataset):
        """PROCESSING以外からはPARSEDに遷移できない"""
        with pytest.raises(ValueError):
            dataset.mark_parsed()

    def test_mark_failed_records_error(self, dataset):
        """エラー情報が保存される"""
        error = ValueError("bad csv")

        dataset.mark_failed(error)
        dataset.refresh_from_db()

        assert dataset.status == Dataset.Status.FAILED
        assert dataset.parse_result["error_type"] == "ValueError"
        assert dataset.parse_result["message"] == "bad csv"

    def test_dataset_delete_cascades_datapoints(self, dataset):
        """Dataset削除でDataPointも削除される"""
        DataPoint.objects.create(
            dataset=dataset,
            raw_time="2020",
            metric="temp",
            order_index=1,
        )

        dataset.delete()

        assert DataPoint.objects.count() == 0


# ============================
# DataPoint Tests
# ============================


@pytest.mark.django_db
class TestDataPointModel:

    def test_default_entity_value(self, dataset):
        """entity の default が 'default'"""
        dp = DataPoint.objects.create(
            dataset=dataset,
            raw_time="2020",
            metric="temp",
            order_index=1,
        )

        assert dp.entity == "default"

    def test_unique_constraint_dataset_entity_metric_time(self, dataset):
        """unique制約が効く"""
        DataPoint.objects.create(
            dataset=dataset,
            raw_time="2020",
            metric="temp",
            entity="Japan",
            order_index=1,
        )

        with pytest.raises(IntegrityError):
            DataPoint.objects.create(
                dataset=dataset,
                raw_time="2020",
                metric="temp",
                entity="Japan",
                order_index=2,
            )

    def test_time_can_be_null(self, dataset):
        """time フィールドは null OK"""
        dp = DataPoint.objects.create(
            dataset=dataset,
            raw_time="2020",
            metric="temp",
            time=None,
            order_index=1,
        )

        assert dp.time is None

    def test_value_can_be_null(self, dataset):
        """value フィールドは null OK"""
        dp = DataPoint.objects.create(
            dataset=dataset,
            raw_time="2020",
            metric="temp",
            value=None,
            order_index=1,
        )

        assert dp.value is None
