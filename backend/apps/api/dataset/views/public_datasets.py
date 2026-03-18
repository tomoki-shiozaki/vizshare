from rest_framework import generics
from rest_framework.permissions import AllowAny

from apps.api.dataset.serializers.public_datasets import PublicDatasetSerializer
from apps.dataset.models import Dataset


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
