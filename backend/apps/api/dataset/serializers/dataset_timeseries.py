from rest_framework import serializers

from apps.dataset.models import DataPoint


class DataPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataPoint
        fields = [
            "raw_time",
            "time",
            "entity",
            "metric",
            "value",
        ]


class DatasetMetaSerializer(serializers.Serializer):
    entities = serializers.ListField(child=serializers.CharField())
    metrics = serializers.ListField(child=serializers.CharField())
