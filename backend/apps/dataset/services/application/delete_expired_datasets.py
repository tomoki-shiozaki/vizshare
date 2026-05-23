from django.utils import timezone

from apps.dataset.models import Dataset


def delete_expired_anonymous_datasets() -> int:
    expired_datasets = Dataset.objects.filter(
        owner__isnull=True,
        expires_at__isnull=False,
        expires_at__lt=timezone.now(),
    )

    count = expired_datasets.count()

    for dataset in expired_datasets:
        dataset.delete()

    return count
