import pytest

from apps.api.dataset.services.entity_comparison_builder import (
    build_entity_comparison_data,
)
from apps.dataset.models import DataPoint
from apps.dataset.services.csv_parser import parse_row_time


@pytest.mark.django_db
class TestBuildEntityComparisonData:
    def test_basic_wide_transformation(self, dataset):
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

        qs = DataPoint.objects.filter(dataset=dataset).order_by("raw_time")

        result = build_entity_comparison_data(qs)

        assert result == [
            {"time": "2026-03-13T00:00:00Z", "A": 1.0},
            {"time": "2026-03-13T01:00:00Z", "B": 2.0},
        ]

    def test_order_is_preserved(self, dataset):
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T01:00:00Z",
            time=parse_row_time("2026-03-13T01:00:00Z"),
            value=2,
            order_index=0,
        )
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=1,
            order_index=0,
        )

        qs = DataPoint.objects.filter(dataset=dataset).order_by("raw_time")

        result = build_entity_comparison_data(qs)

        assert [r["time"] for r in result] == [
            "2026-03-13T00:00:00Z",
            "2026-03-13T01:00:00Z",
        ]

    def test_duplicate_time_entity_overwrite_last_wins(self, dataset):
        # 同じ entity・time だが order_index が違う
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:00Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=1,
            order_index=0,
        )
        # raw_time変えてDB制約回避（timeは同じにする）
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:01Z",
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=99,
            order_index=1,
        )

        qs = DataPoint.objects.filter(dataset=dataset).order_by("order_index")

        result = build_entity_comparison_data(qs)

        assert result == [{"time": "2026-03-13T00:00:01Z", "A": 99.0}]

    def test_missing_entity_not_included(self, dataset):
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

        qs = DataPoint.objects.filter(dataset=dataset).order_by("raw_time")

        result = build_entity_comparison_data(qs)

        assert result == [
            {"time": "2026-03-13T00:00:00Z", "A": 1.0},
            {"time": "2026-03-13T01:00:00Z", "B": 2.0},
        ]

    def test_empty_input(self):
        assert build_entity_comparison_data([]) == []
