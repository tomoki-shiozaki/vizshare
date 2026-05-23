import pytest

from apps.dataset.models import Dataset
from apps.dataset.services.application.transfer_dataset_ownership import (
    transfer_anonymous_datasets_to_user,
)


@pytest.mark.django_db
class TestTransferAnonymousDatasetsToUser:
    def test_transfer_dataset_to_user(
        self,
        user,
        anonymous_dataset,
        anonymous_id,
    ):
        updated_count = transfer_anonymous_datasets_to_user(
            anonymous_id=anonymous_id,
            user=user,
        )

        anonymous_dataset.refresh_from_db()

        assert updated_count == 1

        assert anonymous_dataset.owner == user
        assert anonymous_dataset.anonymous_id is None
        assert anonymous_dataset.expires_at is None

    def test_transfer_only_target_anonymous_dataset(
        self,
        user,
        anonymous_dataset,
        another_anonymous_dataset,
        anonymous_id,
        another_anonymous_id,
    ):
        updated_count = transfer_anonymous_datasets_to_user(
            anonymous_id=anonymous_id,
            user=user,
        )

        anonymous_dataset.refresh_from_db()
        another_anonymous_dataset.refresh_from_db()

        assert updated_count == 1

        # 対象 dataset は移行される
        assert anonymous_dataset.owner == user
        assert anonymous_dataset.anonymous_id is None

        # 別 anonymous_id の dataset は変更されない
        assert another_anonymous_dataset.owner is None
        assert another_anonymous_dataset.anonymous_id == another_anonymous_id

    def test_return_zero_when_no_matching_dataset(
        self,
        user,
        another_anonymous_dataset,
        anonymous_id,
    ):
        updated_count = transfer_anonymous_datasets_to_user(
            anonymous_id=anonymous_id,
            user=user,
        )

        assert updated_count == 0

    def test_already_owned_dataset_is_not_updated(
        self,
        user,
        dataset,
        anonymous_id,
    ):
        updated_count = transfer_anonymous_datasets_to_user(
            anonymous_id=anonymous_id,
            user=user,
        )

        dataset.refresh_from_db()

        assert updated_count == 0

        assert dataset.owner == user
