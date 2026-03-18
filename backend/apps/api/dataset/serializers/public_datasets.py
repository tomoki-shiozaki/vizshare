from rest_framework import serializers

from apps.dataset.models import Dataset


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
