from django.shortcuts import get_object_or_404, redirect
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.api.dataset.serializers.dataset_read import (
    AnonymousDatasetDetailSerializer,
    DatasetDetailSerializer,
    DatasetListSerializer,
    PublicDatasetDetailSerializer,
    PublicDatasetSerializer,
)
from apps.core.services.anonymous import get_anonymous_id
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


class AnonymousDatasetDetailAPIView(generics.RetrieveAPIView):
    serializer_class = AnonymousDatasetDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        anonymous_id = get_anonymous_id(self.request)

        if not anonymous_id:
            return Dataset.objects.none()

        return Dataset.objects.filter(
            anonymous_id=anonymous_id,
        )


class PublicDatasetListAPIView(generics.ListAPIView):
    """
    公開データセット一覧
    """

    serializer_class = PublicDatasetSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Dataset.objects.filter(
                visibility=Dataset.Visibility.PUBLIC,
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
        return Dataset.objects.filter(
            visibility=Dataset.Visibility.PUBLIC,
            status=Dataset.Status.PARSED,
        )


class PublicDatasetDownloadAPIView(generics.GenericAPIView):
    """
    公開データセットのダウンロード
    """

    permission_classes = [AllowAny]

    def get(self, request, pk):
        dataset = get_object_or_404(
            Dataset,
            pk=pk,
            visibility=Dataset.Visibility.PUBLIC,
            status=Dataset.Status.PARSED,
        )

        return redirect(dataset.get_download_url())
