from rest_framework import serializers

from apps.dataset.models import DataPoint, Dataset


class DatasetSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

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
    def validate_schema(self, value):
        """
        schemaの「形」だけを検証する
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("schema must be a JSON object")

        # time
        if "time" not in value:
            raise serializers.ValidationError("schema must contain 'time'")
        if not isinstance(value["time"], str):
            raise serializers.ValidationError("'time' must be a string")

        # entity（任意）
        if "entity" in value and value["entity"] is not None:
            if not isinstance(value["entity"], str):
                raise serializers.ValidationError("'entity' must be a string")

        # metrics
        if "metrics" not in value:
            raise serializers.ValidationError("schema must contain 'metrics'")
        if not isinstance(value["metrics"], list) or not value["metrics"]:
            raise serializers.ValidationError("'metrics' must be a non-empty list")
        if not all(isinstance(m, str) for m in value["metrics"]):
            raise serializers.ValidationError("each metric must be a string")

        return value


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
        read_only_fields = [
            "id",
            "name",
            "status",
            "created_at",
            "schema",
            "parse_result",
        ]


class DatasetSchemaSerializer(serializers.Serializer):
    time = serializers.CharField()
    entity = serializers.CharField(required=False, allow_null=True)
    metrics = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
    )


class ParseResultSerializer(serializers.Serializer):
    status = serializers.CharField(required=False)
    row_count = serializers.IntegerField(required=False)

    error_type = serializers.CharField(required=False)
    message = serializers.CharField(required=False)


class DatasetDetailSerializer(serializers.ModelSerializer):
    schema = DatasetSchemaSerializer()
    parse_result = ParseResultSerializer(required=False, allow_null=True)

    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "status",
            "created_at",
            "schema",
            "parse_result",
            "source_file",
        ]
        read_only_fields = [
            "id",
            "name",
            "status",
            "created_at",
            "schema",
            "parse_result",
            "source_file",
        ]


class DataPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataPoint
        fields = [
            "time",
            "raw_time",
            "value",
            "series",
        ]
