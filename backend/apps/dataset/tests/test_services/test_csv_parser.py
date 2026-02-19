import io

import pytest
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.utils.timezone import is_aware

from apps.dataset.models import DataPoint, Dataset
from apps.dataset.services.csv_parser import (
    _open_csv_text_stream,
    parse_dataset_csv,
    parse_row_time,
    parse_value,
)

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="password",
    )


@pytest.fixture
def dataset(db, user):
    """共通 Dataset fixture"""
    csv_content = """date,entity,metric1,metric2
2023-01-01,A,1.5,2.5
2023-02-01,B,3.5,4.5
"""
    return Dataset.objects.create(
        owner=user,
        name="test dataset",
        source_file=ContentFile(csv_content, name="test.csv"),
        schema={
            "time": "date",
            "entity": "entity",
            "metrics": ["metric1", "metric2"],
        },
    )


# ============================
# CSV Parser Tests
# ============================


@pytest.mark.django_db
class TestCsvParser:

    # ----------------------------
    # parse_dataset_csv tests
    # ----------------------------

    def test_parse_dataset_csv_basic(self, dataset):
        total = parse_dataset_csv(dataset)

        # 2行 x 2 metrics = 4 DataPoint
        assert total == 4
        assert DataPoint.objects.count() == 4

        dp = DataPoint.objects.get(dataset=dataset, entity="A", metric="metric1")
        assert dp.value == 1.5
        assert dp.raw_time == "2023-01-01"
        assert dp.time is not None
        assert is_aware(dp.time)

    def test_parse_dataset_csv_default_entity(self, user):
        """entity列がない場合は '__default__' を使う"""
        csv_content = """date,metric1
2023-01-01,1.0
"""
        dataset = Dataset.objects.create(
            owner=user,
            name="no_entity",
            source_file=ContentFile(csv_content, name="no_entity.csv"),
            schema={"time": "date", "metrics": ["metric1"]},
        )
        total = parse_dataset_csv(dataset)
        dp = DataPoint.objects.first()
        assert dp is not None
        assert dp.entity == DataPoint.DEFAULT_ENTITY
        assert total == 1

    def test_parse_dataset_csv_batching(self, user, monkeypatch):
        """BATCH_SIZE をまたぐ場合の動作"""
        from apps.dataset.services import csv_parser

        monkeypatch.setattr(csv_parser, "BATCH_SIZE", 2)

        csv_content = """date,entity,metric1
2023-01-01,A,1
2023-01-02,B,2
2023-01-03,C,3
"""
        dataset = Dataset.objects.create(
            owner=user,
            name="batch",
            source_file=ContentFile(csv_content, name="batch.csv"),
            schema={"time": "date", "entity": "entity", "metrics": ["metric1"]},
        )
        total = parse_dataset_csv(dataset)
        assert total == 3
        assert DataPoint.objects.count() == 3

    # ----------------------------
    # parse_row_time tests
    # ----------------------------

    @pytest.mark.parametrize(
        "raw_time,expected",
        [
            ("2023", (2023, 1, 1)),
            ("2023.0", (2023, 1, 1)),
            ("2023-07", (2023, 7, 1)),
            ("2023/07", (2023, 7, 1)),
            ("2023-07-15", (2023, 7, 15)),
            ("15/07/2023", (2023, 7, 15)),
            ("invalid", None),
            ("", None),
        ],
    )
    def test_parse_row_time_variants(self, raw_time, expected):
        dt = parse_row_time(raw_time)
        if expected is None:
            assert dt is None
        else:
            year, month, day = expected
            assert dt is not None
            assert dt.year == year
            assert dt.month == month
            assert dt.day == day
            assert is_aware(dt)

    # ----------------------------
    # parse_value tests
    # ----------------------------

    @pytest.mark.parametrize(
        "value_str,expected",
        [
            ("123", 123.0),
            ("  45.6 ", 45.6),
            ("", None),
            (None, None),
            ("abc", None),  # 無効な値も None
        ],
    )
    def test_parse_value(self, value_str, expected):
        assert parse_value(value_str, row=0, metric="m") == expected

    # ----------------------------
    # _open_csv_text_stream tests
    # ----------------------------
    def test_open_csv_text_stream_utf8(self):
        data = "a,b\n1,2".encode("utf-8")
        f = io.BytesIO(data)

        text = _open_csv_text_stream(f)

        assert text.read() == "a,b\n1,2"

    def test_open_csv_text_stream_cp932(self):
        data = "列1,列2\n1,2".encode("cp932")
        f = io.BytesIO(data)

        text = _open_csv_text_stream(f)

        assert "列1" in text.read()
