from django.contrib import admin

from apps.dataset.models import DataPoint, Dataset

admin.site.register(Dataset)
admin.site.register(DataPoint)
