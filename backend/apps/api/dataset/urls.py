from django.urls import path

from apps.api.dataset.views.dataset_read import (
    DatasetDetailAPIView,
    DatasetListAPIView,
    PublicDatasetDetailAPIView,
    PublicDatasetDownloadAPIView,
    PublicDatasetListAPIView,
)
from apps.api.dataset.views.dataset_timeseries import (
    DatasetDataPointAPIView,
    DatasetMetaAPIView,
    DatasetTimeSeriesAPIView,
    PublicDatasetTimeSeriesAPIView,
)
from apps.api.dataset.views.dataset_write import (
    DatasetCreateAPIView,
    DatasetVisibilityUpdateAPIView,
)

app_name = "dataset"

urlpatterns = [
    path("", DatasetListAPIView.as_view(), name="list"),
    path("create/", DatasetCreateAPIView.as_view(), name="create"),
    path("<int:pk>/", DatasetDetailAPIView.as_view(), name="detail"),
    # --- Core APIs ---
    path(
        "<int:pk>/data-points/", DatasetDataPointAPIView.as_view(), name="data-points"
    ),
    path("<int:pk>/meta/", DatasetMetaAPIView.as_view(), name="meta"),
    # --- Legacy / UI-oriented ---
    path("<int:pk>/timeseries/", DatasetTimeSeriesAPIView.as_view(), name="timeseries"),
    path(
        "<int:pk>/visibility/",
        DatasetVisibilityUpdateAPIView.as_view(),
        name="visibility",
    ),
    path("public/", PublicDatasetListAPIView.as_view(), name="public"),
    path(
        "public/<int:pk>/", PublicDatasetDetailAPIView.as_view(), name="public-detail"
    ),
    # public版
    path(
        "public/<int:pk>/timeseries/",
        PublicDatasetTimeSeriesAPIView.as_view(),
        name="public-timeseries",
    ),
    path(
        "public/<int:pk>/download/",
        PublicDatasetDownloadAPIView.as_view(),
        name="public-download",
    ),
]
