from django.urls import path

from apps.api.dataset.views.datapoint import DatasetDataAPIView
from apps.api.dataset.views.dataset import (
    DatasetDetailAPIView,
    DatasetListAPIView,
    DatasetUploadAPIView,
)
from apps.api.dataset.views.public_datasets import PublicDatasetListAPIView

app_name = "dataset"

urlpatterns = [
    path("upload/", DatasetUploadAPIView.as_view(), name="upload"),
    path("list/", DatasetListAPIView.as_view(), name="list"),
    path("<int:pk>/", DatasetDetailAPIView.as_view(), name="detail"),
    path("<int:pk>/data/", DatasetDataAPIView.as_view(), name="datapoints"),
    path("public/", PublicDatasetListAPIView.as_view(), name="public-list"),
]
