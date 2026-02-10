import csv

from rest_framework.exceptions import ValidationError


def read_csv_header(source_file) -> list[str]:
    """
    CSV全文を読まず、ヘッダ行のみを安全に取得する
    """
    try:
        source_file.seek(0)
        raw_line = source_file.readline()
        header_line = raw_line.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise ValidationError("CSVの文字コードはUTF-8である必要があります")
    finally:
        # 後続処理のため、必ず先頭に戻す
        source_file.seek(0)

    if not header_line.strip():
        raise ValidationError("CSVにヘッダ行が存在しません")

    try:
        reader = csv.reader([header_line])
        header = next(reader)
    except Exception:
        raise ValidationError("CSVのヘッダ行を正しく解析できません")

    # 前後の空白を除去（人間の入力ゆらぎ対策）
    return [h.strip() for h in header]


def validate_csv_against_schema(source_file, schema: dict):
    header = read_csv_header(source_file)

    required_cols = [schema["time"], *schema["metrics"]]
    if schema.get("entity"):
        required_cols.append(schema["entity"])

    missing = [c for c in required_cols if c not in header]
    if missing:
        raise ValidationError(f"CSVに存在しない列名: {', '.join(missing)}")
