from django.urls import path

from apps.api.dataset.views import DatasetListAPIView, DatasetUploadAPIView

app_name = "dataset"

urlpatterns = [
    path("upload/", DatasetUploadAPIView.as_view(), name="upload"),
    path("list/", DatasetListAPIView.as_view(), name="list"),
]
