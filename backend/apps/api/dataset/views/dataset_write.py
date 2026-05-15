from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle

from apps.api.dataset.serializers.dataset_write import (
    AnonymousDatasetCreateSerializer,
    DatasetCreateSerializer,
    DatasetVisibilitySerializer,
)
from apps.core.services.anonymous import get_or_create_anonymous_id
from apps.core.services.cookies import set_anonymous_cookie
from apps.dataset.models import Dataset
from apps.dataset.services.application.build_dataset import create_dataset


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


class AnonymousUploadThrottle(AnonRateThrottle):
    rate = "10/hour"


class DatasetAnonymousCreateAPIView(generics.CreateAPIView):
    queryset = Dataset.objects.all()
    serializer_class = AnonymousDatasetCreateSerializer
    permission_classes = [AllowAny]  # or throttle強め
    throttle_classes = [AnonymousUploadThrottle]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        return set_anonymous_cookie(
            response, self.anonymous_id, self._created_anonymous
        )

    def perform_create(self, serializer):
        data = serializer.validated_data

        anonymous_id, created = get_or_create_anonymous_id(self.request)

        self.anonymous_id = anonymous_id
        self._created_anonymous = created

        dataset = create_dataset(
            anonymous_id=anonymous_id,
            name=data["name"],
            source_file=data["source_file"],
            schema=data["schema"],
        )

        serializer.instance = dataset
