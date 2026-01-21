from rest_framework import generics, permissions

from apps.api.dataset.serializers import DatasetSerializer
from apps.dataset.models import Dataset


class DatasetUploadAPIView(generics.CreateAPIView):
    """
    Dataset のアップロード専用 API
    Next.js からファイルをアップロード可能
    """

    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    permission_classes = [permissions.IsAuthenticated]  # ログイン必須

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # DRFはデフォルトで multipart/form-data をサポートするので特別な設定は不要
