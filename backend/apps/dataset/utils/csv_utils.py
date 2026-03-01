from charset_normalizer import from_bytes


def detect_csv_encoding(file_obj, sample_size: int = 4096) -> str:
    """CSVファイルの文字コードを軽量判定して返す（charset-normalizer使用）"""
    # 現在位置から sample_size バイトだけ読む（メモリ安全）
    pos = file_obj.tell()
    sample = file_obj.read(sample_size)
    file_obj.seek(pos)

    # BOM 判定（UTF-8 BOMやUTF-16はライブラリより確実）
    if sample.startswith(b"\xef\xbb\xbf"):
        return "utf-8-sig"
    elif sample.startswith(b"\xff\xfe"):
        return "utf-16-le"
    elif sample.startswith(b"\xfe\xff"):
        return "utf-16-be"

    # charset-normalizer に判定させる
    result = from_bytes(sample).best()
    if result is None or result.encoding is None:
        raise ValueError("CSVの文字コードを判定できません。")

    # encoding の名前を返す
    return result.encoding
