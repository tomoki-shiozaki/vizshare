from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.api.dataset.serializers.dataset_write import (
    DatasetCreateSerializer,
    DatasetVisibilitySerializer,
)
from apps.dataset.models import Dataset
from apps.dataset.services.dataset_service import create_dataset


class DatasetCreateAPIView(generics.CreateAPIView):
    """
    Dataset のアップロード専用 API
    """

    queryset = Dataset.objects.all()
    serializer_class = DatasetCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        data = serializer.validated_data
        dataset = create_dataset(
            owner=self.request.user,
            name=data["name"],
            source_file=data["source_file"],
            schema=data["schema"],
        )
        serializer.instance = dataset


class DatasetVisibilityUpdateAPIView(generics.UpdateAPIView):
    """
    Dataset の公開状態を変更する API
    """

    serializer_class = DatasetVisibilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dataset.objects.filter(owner=self.request.user)
