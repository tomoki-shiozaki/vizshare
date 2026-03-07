import io

import pytest
from rest_framework.exceptions import ValidationError

from apps.dataset.services.csv_validation import (
    read_csv_header,
    validate_csv_against_schema,
)

# -----------------------------
# read_csv_header のテスト
# -----------------------------


@pytest.mark.parametrize(
    "content,expected_header",
    [
        (b"col1,col2,col3\n", ["col1", "col2", "col3"]),  # UTF-8
        (
            "col1,col2,col3\n".encode("utf-8-sig"),
            ["col1", "col2", "col3"],
        ),  # UTF-8-SIG
        (
            "あいう,かきく,さしす\n".encode("cp932"),
            ["あいう", "かきく", "さしす"],
        ),  # CP932
        (
            " col1 , col2 , col3 \n".encode("utf-8"),
            ["col1", "col2", "col3"],
        ),  # 空白トリム
    ],
)
def test_read_csv_header_success(content, expected_header):
    f = io.BytesIO(content)
    header = read_csv_header(f)
    assert header == expected_header


def test_read_csv_header_empty_file():
    f = io.BytesIO(b"")
    with pytest.raises(ValidationError, match="CSVにヘッダ行が存在しません"):
        read_csv_header(f)


def test_read_csv_header_all_empty_columns():
    f = io.BytesIO(b",,,\n")

    with pytest.raises(ValidationError, match="CSVにヘッダ行が存在しません"):
        read_csv_header(f)


# -----------------------------
# validate_csv_against_schema のテスト
# -----------------------------


def make_csv_file(header_line: str, encoding="utf-8"):
    return io.BytesIO((header_line + "\n").encode(encoding))


@pytest.mark.parametrize(
    "header_line,schema",
    [
        ("time,metric1,metric2", {"time": "time", "metrics": ["metric1", "metric2"]}),
        (
            "time,metric1,metric2,entity",
            {"time": "time", "metrics": ["metric1", "metric2"], "entity": "entity"},
        ),
    ],
)
def test_validate_csv_success(header_line, schema):
    f = make_csv_file(header_line)
    # エラーが出なければ成功
    validate_csv_against_schema(f, schema)


def test_validate_csv_success_japanese_cp932():
    header_line = "時間,メトリック1,メトリック2"
    schema = {"time": "時間", "metrics": ["メトリック1", "メトリック2"]}
    f = make_csv_file(header_line, encoding="cp932")
    # エラーが出なければ成功
    validate_csv_against_schema(f, schema)


def test_validate_csv_missing_required_column():
    header_line = "time,metric1"
    schema = {"time": "time", "metrics": ["metric1", "metric2"]}
    f = make_csv_file(header_line)
    with pytest.raises(ValidationError, match="CSVに存在しない列名: metric2"):
        validate_csv_against_schema(f, schema)


def test_validate_csv_missing_entity_column():
    header_line = "time,metric1,metric2"
    schema = {"time": "time", "metrics": ["metric1", "metric2"], "entity": "entity"}
    f = make_csv_file(header_line)
    with pytest.raises(ValidationError, match="CSVに存在しない列名: entity"):
        validate_csv_against_schema(f, schema)


def test_validate_csv_multiple_missing_columns():
    header_line = "time"
    schema = {"time": "time", "metrics": ["metric1", "metric2"]}

    f = make_csv_file(header_line)

    with pytest.raises(
        ValidationError,
        match="CSVに存在しない列名: metric1, metric2",
    ):
        validate_csv_against_schema(f, schema)


def test_validate_csv_header_error(mocker):
    f = make_csv_file("dummy")

    mocker.patch(
        "apps.dataset.services.csv_validation.read_csv_header",
        side_effect=ValueError("CSV読み込み失敗"),
    )

    with pytest.raises(ValidationError, match="CSV読み込み失敗"):
        validate_csv_against_schema(f, {"time": "time", "metrics": []})
