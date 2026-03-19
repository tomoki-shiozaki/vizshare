from rest_framework import serializers


class DatasetSchemaSerializer(serializers.Serializer):
    time = serializers.CharField()
    entity = serializers.CharField(required=False)
    metrics = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
    )


class ParseResultSerializer(serializers.Serializer):
    row_count = serializers.IntegerField(required=False)

    error_type = serializers.CharField(required=False)
    message = serializers.CharField(required=False)
