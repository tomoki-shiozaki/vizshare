from django.urls import path

from apps.api.dataset.views.datapoint import DatasetDataAPIView
from apps.api.dataset.views.dataset_read import (
    DatasetDetailAPIView,
    DatasetListAPIView,
    PublicDatasetListAPIView,
)
from apps.api.dataset.views.dataset_write import DatasetCreateAPIView

app_name = "dataset"

urlpatterns = [
    path("", DatasetListAPIView.as_view(), name="list"),
    path("create/", DatasetCreateAPIView.as_view(), name="create"),
    path("<int:pk>/", DatasetDetailAPIView.as_view(), name="detail"),
    path("<int:pk>/data/", DatasetDataAPIView.as_view(), name="datapoints"),
    path("public/", PublicDatasetListAPIView.as_view(), name="public"),
]
