from rest_framework import serializers


class DatasetMetaSerializer(serializers.Serializer):
    entities = serializers.ListField(child=serializers.CharField())
    metrics = serializers.ListField(child=serializers.CharField())
