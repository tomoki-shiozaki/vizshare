from datetime import timedelta

import pytest
from django.utils import timezone

from apps.dataset.models import Dataset
from apps.dataset.services.application.delete_expired_datasets import (
    delete_expired_anonymous_datasets,
)


@pytest.mark.django_db
class TestDeleteExpiredAnonymousDatasets:

    def test_delete_only_expired_anonymous_datasets(
        self,
        anonymous_id,
        user,
    ):
        """
        期限切れ匿名Datasetのみ削除される
        """

        expired_dataset = Dataset.objects.create(
            name="expired",
            anonymous_id=anonymous_id,
            expires_at=timezone.now() - timedelta(days=1),
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        not_expired_dataset = Dataset.objects.create(
            name="not expired",
            anonymous_id=anonymous_id,
            expires_at=timezone.now() + timedelta(days=1),
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        user_dataset = Dataset.objects.create(
            name="user dataset",
            owner=user,
            expires_at=timezone.now() - timedelta(days=1),
            schema={
                "time": "timestamp",
                "metrics": ["value"],
            },
        )

        deleted_count = delete_expired_anonymous_datasets()

        assert deleted_count == 1

        assert not Dataset.objects.filter(pk=expired_dataset.pk).exists()

        assert Dataset.objects.filter(pk=not_expired_dataset.pk).exists()

        assert Dataset.objects.filter(pk=user_dataset.pk).exists()

    def test_return_zero_when_no_expired_datasets(
        self,
        anonymous_dataset,
    ):
        """
        削除対象がない場合は0を返す
        """

        anonymous_dataset.expires_at = timezone.now() + timedelta(days=1)
        anonymous_dataset.save()

        deleted_count = delete_expired_anonymous_datasets()

        assert deleted_count == 0

    def test_delete_expired_dataset_with_datapoints(
        self,
        anonymous_dataset,
    ):
        """
        期限切れDataset削除時にDataPointもcascade削除される
        """

        anonymous_dataset.expires_at = timezone.now() - timedelta(days=1)
        anonymous_dataset.save()

        deleted_count = delete_expired_anonymous_datasets()

        assert deleted_count == 1

        assert Dataset.objects.count() == 0
