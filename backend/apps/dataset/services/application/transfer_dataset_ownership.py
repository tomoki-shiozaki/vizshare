from uuid import UUID

from django.db import transaction

from apps.dataset.models import Dataset


@transaction.atomic
def transfer_anonymous_datasets_to_user(
    *,
    anonymous_id: UUID,
    user,
) -> int:
    """
    匿名ユーザーの Dataset をログインユーザーへ移行する。

    - owner を設定
    - anonymous_id を削除
    - expires_at を削除

    Returns:
        更新件数
    """

    updated_count = Dataset.objects.filter(
        anonymous_id=anonymous_id,
        owner__isnull=True,
    ).update(
        owner=user,
        anonymous_id=None,
        expires_at=None,
    )

    return updated_count
