from django.core.management.base import BaseCommand

from apps.dataset.services.application.delete_expired_datasets import (
    delete_expired_anonymous_datasets,
)


class Command(BaseCommand):
    help = "Delete expired anonymous datasets"

    def handle(self, *args, **options):
        count = delete_expired_anonymous_datasets()

        self.stdout.write(self.style.SUCCESS(f"Deleted {count} expired datasets"))
