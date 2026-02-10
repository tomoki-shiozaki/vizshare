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
from apps.dataset.services.csv_validation import validate_csv_against_schema
from apps.dataset.services.enqueue import enqueue_parse_dataset


class DatasetUploadAPIView(generics.CreateAPIView):
    """
    Dataset のアップロード専用 API
    """

    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        dataset = serializer.save(owner=self.request.user)

        # CSV × schema の整合性チェック（即時）
        validate_csv_against_schema(dataset.source_file, dataset.schema)

        # 問題なければ非同期解析へ
        enqueue_parse_dataset(dataset.id)


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
