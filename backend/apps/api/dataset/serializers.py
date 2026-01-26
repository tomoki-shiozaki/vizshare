import csv

from rest_framework import serializers

from apps.dataset.models import Dataset


class DatasetSerializer(serializers.ModelSerializer):
    # ownerはユーザー側から送らせず、バックエンドで設定
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    schema = serializers.JSONField(required=False)  # フロントから送信可能

    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "source_file",
            "owner",
            "status",
            "schema",
            "created_at",
        ]

    # --------------------
    # Validation
    # --------------------
    def validate(self, attrs):
        source_file = attrs.get("source_file")
        schema = attrs.get("schema")

        if not self._should_validate_csv(source_file, schema):
            return attrs

        header = self._read_csv_header(source_file)
        self._validate_header_against_schema(header, schema)

        return attrs

    def validate_schema(self, value):
        """
        schemaに必ず'time'と'value'が含まれていることを確認
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("schema must be a JSON object")

        required_keys = ["time", "value"]
        missing_keys = [k for k in required_keys if k not in value]
        if missing_keys:
            raise serializers.ValidationError(
                f"schema is missing required keys: {', '.join(missing_keys)}"
            )
        return value

    # --------------------
    # Helper methods
    # --------------------
    def _should_validate_csv(self, source_file, schema):
        """
        CSVとschemaがそろっており、最低限のチェックが可能か
        """
        return bool(
            source_file and schema and schema.get("time") and schema.get("value")
        )

    def _read_csv_header(self, source_file):
        """
        CSV全文を読まず、ヘッダ行のみを安全に取得する
        """
        try:
            source_file.seek(0)
            raw_line = source_file.readline()
            header_line = raw_line.decode("utf-8-sig")
        except UnicodeDecodeError:
            raise serializers.ValidationError(
                "CSVの文字コードはUTF-8である必要があります"
            )
        finally:
            # 後続処理のため、必ず先頭に戻す
            source_file.seek(0)

        if not header_line.strip():
            raise serializers.ValidationError("CSVにヘッダ行が存在しません")

        try:
            reader = csv.reader([header_line])
            header = next(reader)
        except Exception:
            raise serializers.ValidationError("CSVのヘッダ行を正しく解析できません")

        # 前後の空白を除去（人間の入力ゆらぎ対策）
        return [h.strip() for h in header]

    def _validate_header_against_schema(self, header, schema):
        """
        schemaで指定された列がCSVヘッダに存在するか確認
        """
        required_cols = (schema["time"], schema["value"])
        missing = [col for col in required_cols if col not in header]

        if missing:
            raise serializers.ValidationError(
                f"CSVに存在しない列名: {', '.join(missing)}"
            )


class DatasetListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "status",
            "created_at",
            "schema",
            "parse_result",
        ]
        read_only_fields = fields
