from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.api.dataset.serializers.dataset_write import DatasetCreateSerializer
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
