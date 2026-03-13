from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from apps.api.dataset.serializers import (
    DatasetDetailSerializer,
    DatasetListSerializer,
    DatasetUploadSerializer,
)
from apps.dataset.models import Dataset
from apps.dataset.services.dataset_service import create_dataset


class DatasetUploadAPIView(generics.CreateAPIView):
    """
    Dataset のアップロード専用 API
    """

    queryset = Dataset.objects.all()
    serializer_class = DatasetUploadSerializer
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


class DatasetListAPIView(generics.ListAPIView):
    """
    ログインユーザーの Dataset 一覧を返す API
    """

    serializer_class = DatasetListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dataset.objects.filter(owner=self.request.user).order_by("-created_at")


class DatasetDetailAPIView(generics.RetrieveAPIView):
    """
    Dataset の詳細情報を返す API
    """

    serializer_class = DatasetDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dataset.objects.filter(owner=self.request.user)
