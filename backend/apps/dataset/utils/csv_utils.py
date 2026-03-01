def detect_csv_encoding(file_obj, sample_size: int = 4096) -> str:
    """CSVファイルの文字コードを軽量判定して返す"""
    # CSVの文字コードを自動判定
    # 優先順:
    # 1. UTF-8 with BOM (ExcelのUTF-8保存対策)
    # 2. UTF-8 (標準的なCSV)
    # 3. CP932 / Shift-JIS (日本のExcel保存対策)
    # 先頭だけ読む（メモリ安全）
    pos = file_obj.tell()
    sample = file_obj.read(sample_size)
    file_obj.seek(pos)

    # 文字コードを順に試す
    for encoding in ("utf-8-sig", "utf-8", "cp932"):
        try:
            sample.decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue

    raise ValueError(
        "CSVの文字コードを判定できません。UTF-8（BOM付き含む）または Shift-JIS 形式で保存してください。"
    )
