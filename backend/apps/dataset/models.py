from django.conf import settings
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _


class Dataset(models.Model):
    class Status(models.TextChoices):
        UPLOADED = "uploaded", _("アップロード済み")
        PROCESSING = "processing", _("処理中")
        PARSED = "parsed", _("解析完了")
        FAILED = "failed", _("失敗")

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="datasets",
    )
    name = models.CharField(max_length=255)
    source_file = models.FileField(upload_to="datasets/source/")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.UPLOADED
    )

    # ユーザーが指定した列情報
    schema = models.JSONField(blank=True, null=True)

    # 解析結果やエラー情報
    parse_result = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # --- 状態管理メソッド ---
    def mark_processing(self) -> bool:
        with transaction.atomic():
            locked = (
                Dataset.objects.select_for_update().only("id", "status").get(pk=self.pk)
            )
            if locked.status != self.Status.UPLOADED:
                return False
            locked.status = self.Status.PROCESSING
            locked.save(update_fields=["status"])
        return True

    def mark_parsed(self, result: dict | None = None):
        self.status = self.Status.PARSED
        if result is not None:
            self.parse_result = result
        self.save(update_fields=["status", "parse_result"])

    def mark_failed(self, error: Exception):
        self.status = self.Status.FAILED
        self.parse_result = {"error": str(error)}
        self.save(update_fields=["status", "parse_result"])


class DataPoint(models.Model):
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="data_points",
    )

    time = models.DateTimeField()
    value = models.FloatField()
    series = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )
    row_index = models.IntegerField()

    class Meta:
        indexes = [
            models.Index(fields=["dataset", "time"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["dataset", "row_index"],
                name="uniq_dataset_row",
            )
        ]
