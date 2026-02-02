from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.api.dataset.serializers import (
    DataPointSerializer,
    DatasetDetailSerializer,
    DatasetListSerializer,
    DatasetSerializer,
)
from apps.dataset.models import DataPoint, Dataset
from apps.dataset.services.enqueue import enqueue_parse_dataset


class DatasetUploadAPIView(generics.CreateAPIView):
    """
    Dataset のアップロード専用 API
    Next.js からファイルをアップロード可能
    """

    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    permission_classes = [IsAuthenticated]  # ログイン必須

    def perform_create(self, serializer):
        # Dataset を保存
        dataset = serializer.save(owner=self.request.user)

        # アップロード完了次第、解析タスクをキューに投げる
        enqueue_parse_dataset(dataset.id)

    # DRFはデフォルトで multipart/form-data をサポートするので特別な設定は不要


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

    queryset = Dataset.objects.all()
    serializer_class = DatasetDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        ログインユーザーのデータのみに制限
        """
        return self.queryset.filter(owner=self.request.user)


class DatasetDataPointViewSet(ReadOnlyModelViewSet):
    serializer_class = DataPointSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        dataset_id = self.kwargs["dataset_id"]

        return DataPoint.objects.filter(dataset_id=dataset_id).order_by(
            "time", "row_index"
        )
