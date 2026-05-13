import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _


class Dataset(models.Model):
    class Status(models.TextChoices):
        UPLOADED = "uploaded", _("アップロード済み")
        PROCESSING = "processing", _("処理中")
        PARSED = "parsed", _("解析完了")
        FAILED = "failed", _("失敗")

    class Visibility(models.TextChoices):
        PRIVATE = "private", _("非公開")
        UNLISTED = "unlisted", _("限定公開")
        PUBLIC = "public", _("公開")

    public_id = models.UUIDField(
        null=True,
        blank=True,
        editable=False,
        db_index=True,
    )

    # ログインユーザー（任意）
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="datasets",
        null=True,
        blank=True,
    )

    # 匿名ユーザー識別（ログインなし用）
    anonymous_id = models.UUIDField(
        editable=False,
        db_index=True,
        null=True,
        blank=True,
    )

    name = models.CharField(max_length=255)

    source_file = models.FileField(upload_to="datasets/source/")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED,
    )

    # ユーザーが指定した列情報（JSON）
    # {
    #     "time": "<time列名>",         # 必須
    #     "entity": "<entity列名>",     # 任意（未指定の場合は "default" が使用される）
    #     "metrics": ["<metric名>"]     # 1つ以上必須
    # }
    schema = models.JSONField()

    # 解析結果やエラー情報
    parse_result = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="匿名データの有効期限（任意）",
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    (
                        models.Q(owner__isnull=False)
                        & models.Q(anonymous_id__isnull=True)
                    )
                    | (
                        models.Q(owner__isnull=True)
                        & models.Q(anonymous_id__isnull=False)
                    )
                ),
                name="dataset_owner_xor_anonymous",
            )
        ]

    def clean(self):
        if not self.owner and not self.anonymous_id:
            raise ValidationError("owner or anonymous_id is required")

        if self.owner and self.anonymous_id:
            raise ValidationError("cannot have both owner and anonymous_id")

    # --- 状態管理メソッド ---
    def mark_processing(self) -> bool:
        with transaction.atomic():
            locked = Dataset.objects.select_for_update().only("status").get(pk=self.pk)
            if locked.status != self.Status.UPLOADED:
                return False
            locked.status = self.Status.PROCESSING
            locked.save(update_fields=["status"])
        return True

    def mark_parsed(self, result: dict | None = None):
        with transaction.atomic():
            locked = Dataset.objects.select_for_update().only("status").get(pk=self.pk)

            if locked.status != self.Status.PROCESSING:
                raise ValueError("Invalid state transition")

            locked.status = self.Status.PARSED
            if result is not None:
                locked.parse_result = result

            locked.save(update_fields=["status", "parse_result"])

    def mark_failed(self, error: Exception):
        with transaction.atomic():
            locked = Dataset.objects.select_for_update().only("status").get(pk=self.pk)

            if locked.status != self.Status.PROCESSING:
                raise ValueError("Invalid state transition")

            locked.status = self.Status.FAILED
            locked.parse_result = {
                "error_type": error.__class__.__name__,
                "message": str(error),
            }

            locked.save(update_fields=["status", "parse_result"])

    def get_download_url(self):
        storage = self.source_file.storage
        return storage.url(self.source_file.name)


class DataPoint(models.Model):
    DEFAULT_ENTITY = "__default__"

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="data_points",
    )

    # CSVに書かれていた元の time 文字列（Year 等）
    raw_time = models.CharField(max_length=255)

    # パース後の datetime（Year だけなら Jan 1 に正規化など）
    time = models.DateTimeField(blank=True, null=True)

    # entity（Japan など）
    entity = models.CharField(
        max_length=255,
        default=DEFAULT_ENTITY,
    )

    # 指標の種類（CSVの値列名）
    # 例: anomaly, lower, upper
    # 1つの時刻・entityに対して複数のmetricが存在し得る
    metric = models.CharField(max_length=255)

    value = models.FloatField(blank=True, null=True)

    order_index = models.PositiveIntegerField()

    class Meta:
        indexes = [
            models.Index(fields=["dataset", "entity", "time", "order_index"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["dataset", "entity", "metric", "raw_time"],
                name="uniq_dataset_entity_metric_time",
            )
        ]
