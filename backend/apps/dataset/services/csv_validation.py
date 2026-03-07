import csv
import io

from rest_framework.exceptions import ValidationError

from apps.dataset.utils.csv_utils import detect_csv_encoding


def read_csv_header(source_file) -> list[str]:
    """
    CSV全文を読まず、ヘッダ行のみを安全に取得する
    UTF-8-SIG と Shift-JIS に対応
    """
    detected = detect_csv_encoding(source_file)

    text_file = io.TextIOWrapper(source_file, encoding=detected, newline="")
    try:
        reader = csv.reader(text_file)
        try:
            header = next(reader)
        except StopIteration:
            raise ValidationError("CSVにヘッダ行が存在しません")
        except Exception:
            raise ValidationError("CSVのヘッダ行を正しく解析できません")
    finally:
        text_file.detach()

    # 前後の空白を除去
    header = [h.strip() for h in header if h.strip()]
    if not header:
        raise ValidationError("CSVにヘッダ行が存在しません")

    return header


def validate_csv_against_schema(source_file, schema: dict):
    try:
        header = read_csv_header(source_file)
    except ValueError as e:
        # utils の ValueError を DRF 用 ValidationError に変換
        raise ValidationError(str(e))

    required_cols = [schema["time"], *schema["metrics"]]
    if schema.get("entity"):
        required_cols.append(schema["entity"])

    missing = [c for c in required_cols if c not in header]
    if missing:
        raise ValidationError(f"CSVに存在しない列名: {', '.join(missing)}")
