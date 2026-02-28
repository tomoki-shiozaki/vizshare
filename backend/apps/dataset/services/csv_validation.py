import csv
import io

from rest_framework.exceptions import ValidationError


def read_csv_header(source_file) -> list[str]:
    source_file.seek(0)
    sample = source_file.read(4096)

    for encoding in ("utf-8-sig", "utf-8", "cp932"):
        try:
            sample.decode(encoding)
            detected = encoding
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValidationError(
            "CSVの文字コードを自動判定できません。UTF-8（BOM付き含む）または Shift-JIS で保存してください"
        )

    source_file.seek(0)
    text_file = io.TextIOWrapper(source_file, encoding=detected, newline="")
    reader = csv.reader(text_file)
    try:
        header = next(reader)
    except StopIteration:
        raise ValidationError("CSVにヘッダ行が存在しません")
    except Exception:
        raise ValidationError("CSVのヘッダ行を正しく解析できません")

    header = [h.strip() for h in header if h.strip()]
    if not header:
        raise ValidationError("CSVにヘッダ行が存在しません")

    return header


def validate_csv_against_schema(source_file, schema: dict):
    header = read_csv_header(source_file)

    required_cols = [schema["time"], *schema["metrics"]]
    if schema.get("entity"):
        required_cols.append(schema["entity"])

    missing = [c for c in required_cols if c not in header]
    if missing:
        raise ValidationError(f"CSVに存在しない列名: {', '.join(missing)}")
