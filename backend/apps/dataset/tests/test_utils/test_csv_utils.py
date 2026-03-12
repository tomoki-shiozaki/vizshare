import io

import pytest

from apps.dataset.utils.csv_utils import detect_csv_encoding


@pytest.mark.parametrize(
    "content,expected_encoding",
    [
        ("col1,col2,col3\n".encode("utf-8"), "utf-8"),
        ("\ufeffcol1,col2,col3\n".encode("utf-8-sig"), "utf-8-sig"),
        ("あいうえお,かきくけこ\n".encode("cp932"), "cp932"),  # CP932 は日本語を含める
    ],
)
def test_detect_csv_encoding_success(content, expected_encoding):
    f = io.BytesIO(content)
    encoding = detect_csv_encoding(f)
    assert encoding == expected_encoding


def test_detect_csv_encoding_keeps_position():
    content = "col1,col2\n".encode("utf-8")
    f = io.BytesIO(content)

    f.read(2)  # 途中まで読む
    pos = f.tell()

    detect_csv_encoding(f)

    assert f.tell() == pos
