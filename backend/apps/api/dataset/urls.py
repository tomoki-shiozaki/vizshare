from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.api.dataset.views import (
    DatasetDetailAPIView,
    DatasetListAPIView,
    DatasetUploadAPIView,
)

app_name = "dataset"


urlpatterns = [
    path("upload/", DatasetUploadAPIView.as_view(), name="upload"),
    path("list/", DatasetListAPIView.as_view(), name="list"),
    path("<int:pk>/", DatasetDetailAPIView.as_view(), name="detail"),
]
