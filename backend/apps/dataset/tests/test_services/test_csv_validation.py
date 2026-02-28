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
            "\ufeffcol1,col2,col3\n".encode("utf-8-sig"),
            ["col1", "col2", "col3"],
        ),  # UTF-8-SIG
        ("col1,col2,col3\n".encode("cp932"), ["col1", "col2", "col3"]),  # Shift-JIS
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


def test_read_csv_header_unknown_encoding():
    # UTF-16 など非対応文字コード
    f = io.BytesIO("col1,col2\n".encode("utf-16"))
    with pytest.raises(ValidationError, match="CSVの文字コードを自動判定できません"):
        read_csv_header(f)


# -----------------------------
# validate_csv_against_schema のテスト
# -----------------------------


def make_csv_file(header_line: str):
    return io.BytesIO(header_line.encode("utf-8"))


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
