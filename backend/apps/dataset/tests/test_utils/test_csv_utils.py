import io

import pytest

from apps.dataset.utils.csv_utils import detect_csv_encoding


@pytest.mark.parametrize(
    "content,expected_encoding",
    [
        (b"col1,col2,col3\n", "utf-8"),
        ("\ufeffcol1,col2,col3\n".encode("utf-8-sig"), "utf-8-sig"),
        ("col1,col2,col3\n".encode("cp932"), "cp932"),
    ],
)
def test_detect_csv_encoding_success(content, expected_encoding):
    f = io.BytesIO(content)
    encoding = detect_csv_encoding(f)
    assert encoding == expected_encoding


def test_detect_csv_encoding_invalid():
    # UTF-16 のような非対応エンコーディング
    f = io.BytesIO("あいうえお".encode("utf-16"))
    with pytest.raises(ValueError, match="CSVの文字コードを判定できません"):
        detect_csv_encoding(f)
