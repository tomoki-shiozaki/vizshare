from rest_framework import serializers

from apps.api.dataset.serializers.dataset_schema import (
    DatasetSchemaSerializer,
    ParseResultSerializer,
)
from apps.dataset.models import Dataset


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


class PublicDatasetSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username")

    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "owner",
            "created_at",
            "status",
        ]


class PublicDatasetDetailSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username")
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = ["id", "name", "owner", "created_at", "download_url"]

    def get_download_url(self, obj):
        request = self.context.get("request")
        if obj.source_file and request:
            return request.build_absolute_uri(obj.source_file.url)
        return None
