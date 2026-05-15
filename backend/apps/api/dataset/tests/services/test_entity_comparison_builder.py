import pytest

from apps.api.dataset.services.entity_comparison_builder import (
    build_entity_comparison_data,
)
from apps.dataset.models import DataPoint
from apps.dataset.services.ingestion.csv_parser import parse_row_time


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
            entity="A",
            metric="value",
            raw_time="2026-03-13T00:00:01Z",  # 制約回避
            time=parse_row_time("2026-03-13T00:00:00Z"),
            value=99,
            order_index=1,
        )

        qs = DataPoint.objects.filter(dataset=dataset).order_by("order_index")
        result = build_entity_comparison_data(qs)

        assert len(result) == 1
        assert result[0]["A"] == 99.0  # ← 本質だけチェック

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

    def test_multiple_metrics_raises_error(self, dataset):
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
            entity="A",
            metric="anomaly",  # ← 別metric
            raw_time="2026-03-13T00:00:01Z",
            time=parse_row_time("2026-03-13T00:00:01Z"),
            value=0.1,
            order_index=1,
        )

        qs = DataPoint.objects.filter(dataset=dataset).order_by("order_index")

        with pytest.raises(ValueError, match="Multiple metrics"):
            build_entity_comparison_data(qs)

    def test_time_none_raises_error(self, dataset):
        DataPoint.objects.create(
            dataset=dataset,
            entity="A",
            metric="value",
            raw_time="invalid",
            time=None,  # ← NGケース
            value=1,
            order_index=0,
        )

        qs = DataPoint.objects.filter(dataset=dataset)

        with pytest.raises(ValueError, match="time must not be None"):
            build_entity_comparison_data(qs)
