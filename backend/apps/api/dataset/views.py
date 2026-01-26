from rest_framework import generics, permissions

from apps.api.dataset.serializers import DatasetListSerializer, DatasetSerializer
from apps.dataset.models import Dataset
from apps.dataset.services.enqueue import enqueue_parse_dataset


class DatasetUploadAPIView(generics.CreateAPIView):
    """
    Dataset のアップロード専用 API
    Next.js からファイルをアップロード可能
    """

    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    permission_classes = [permissions.IsAuthenticated]  # ログイン必須

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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Dataset.objects.filter(owner=self.request.user).order_by("-created_at")
