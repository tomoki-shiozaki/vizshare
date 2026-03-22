from django.urls import path

from apps.api.dataset.views.dataset_read import (
    DatasetDetailAPIView,
    DatasetListAPIView,
    PublicDatasetDetailAPIView,
    PublicDatasetListAPIView,
)
from apps.api.dataset.views.dataset_timeseries import (
    DatasetTimeSeriesAPIView,
    PublicDatasetTimeSeriesAPIView,
)
from apps.api.dataset.views.dataset_write import DatasetCreateAPIView

app_name = "dataset"

urlpatterns = [
    path("", DatasetListAPIView.as_view(), name="list"),
    path("create/", DatasetCreateAPIView.as_view(), name="create"),
    path("<int:pk>/", DatasetDetailAPIView.as_view(), name="detail"),
    path("<int:pk>/timeseries/", DatasetTimeSeriesAPIView.as_view(), name="timeseries"),
    path("public/", PublicDatasetListAPIView.as_view(), name="public"),
    path(
        "public/<int:pk>/", PublicDatasetDetailAPIView.as_view(), name="public-detail"
    ),
    path(
        "public/<int:pk>/timeseries/",
        PublicDatasetTimeSeriesAPIView.as_view(),
        name="public-timeseries",
    ),
]
