from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.api.dataset.views import (
    DatasetDataPointViewSet,
    DatasetDetailAPIView,
    DatasetListAPIView,
    DatasetUploadAPIView,
)

app_name = "dataset"

router = DefaultRouter()
router.register(
    r"(?P<dataset_id>\d+)/data-points",
    DatasetDataPointViewSet,
    basename="dataset-data-points",
)

urlpatterns = [
    path("upload/", DatasetUploadAPIView.as_view(), name="upload"),
    path("list/", DatasetListAPIView.as_view(), name="list"),
    path("<int:pk>/", DatasetDetailAPIView.as_view(), name="detail"),
    # ViewSet 側
    path("", include(router.urls)),
]
