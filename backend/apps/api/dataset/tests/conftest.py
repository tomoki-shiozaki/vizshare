import pytest

from apps.dataset.models import DataPoint, Dataset
from apps.dataset.services.csv_parser import parse_row_time


@pytest.fixture
def dataset(user):
    return Dataset.objects.create(
        name="Test Dataset",
        owner=user,
        schema={"time": "time_col", "metrics": ["value"]},
    )


@pytest.fixture
def dataset_with_points(dataset):
    DataPoint.objects.create(
        dataset=dataset,
        entity="A",
        metric="value",
        raw_time="2026-03-13T00:00:00Z",
        time=parse_row_time("2026-03-13T00:00:00Z"),  # ←追加
        value=1,
        order_index=0,
    )
    DataPoint.objects.create(
        dataset=dataset,
        entity="A",
        metric="anomaly",
        raw_time="2026-03-13T00:00:00Z",
        time=parse_row_time("2026-03-13T00:00:00Z"),
        value=0.1,
        order_index=1,
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
    return dataset
