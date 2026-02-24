from django.urls import include, path

urlpatterns = [
    path("health/", include("apps.api.health.urls")),
    path("datasets/", include("apps.api.dataset.urls")),
]
