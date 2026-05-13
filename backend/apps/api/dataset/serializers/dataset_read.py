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
            "visibility",
        ]
        read_only_fields = [
            "id",
            "name",
            "status",
            "created_at",
            "schema",
            "parse_result",
            "visibility",
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
            "visibility",
        ]
        read_only_fields = [
            "id",
            "name",
            "status",
            "created_at",
            "schema",
            "parse_result",
            "visibility",
        ]


class AnonymousDatasetDetailSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(
        choices=Dataset.Status.choices,
        read_only=True,
    )

    visibility = serializers.ChoiceField(
        choices=Dataset.Visibility.choices,
        read_only=True,
    )

    schema = DatasetSchemaSerializer()

    parse_result = ParseResultSerializer(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Dataset
        fields = [
            "public_id",
            "name",
            "status",
            "created_at",
            "schema",
            "parse_result",
            "visibility",
            "expires_at",
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

    class Meta:
        model = Dataset
        fields = ["id", "name", "owner", "created_at"]
