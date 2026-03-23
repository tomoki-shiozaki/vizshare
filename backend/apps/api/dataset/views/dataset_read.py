from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.api.dataset.serializers.dataset_read import (
    DatasetDetailSerializer,
    DatasetDownloadSerializer,
    DatasetListSerializer,
    PublicDatasetDetailSerializer,
    PublicDatasetSerializer,
)
from apps.dataset.models import Dataset


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


class PublicDatasetListAPIView(generics.ListAPIView):
    """
    公開データセット一覧
    """

    serializer_class = PublicDatasetSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Dataset.objects.filter(
                is_public=True,
                status=Dataset.Status.PARSED,
            )
            .select_related("owner")
            .order_by("-created_at")
        )


class PublicDatasetDetailAPIView(generics.RetrieveAPIView):
    """
    公開データセットの詳細
    """

    serializer_class = PublicDatasetDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Dataset.objects.filter(is_public=True, status=Dataset.Status.PARSED)


class PublicDatasetDownloadAPIView(generics.GenericAPIView):
    """
    公開データセットのダウンロードURL取得
    """

    serializer_class = DatasetDownloadSerializer
    permission_classes = [AllowAny]

    def get(self, request, pk):
        dataset = get_object_or_404(
            Dataset,
            pk=pk,
            is_public=True,
            status=Dataset.Status.PARSED,
        )

        serializer = self.get_serializer(dataset)
        return Response(serializer.data)
