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

    source_file = models.FileField(
        upload_to="datasets/source/",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED,
    )

    schema = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def mark_processing(self) -> bool:
        """
        uploaded → processing への遷移をアトミックに行う
        """
        with transaction.atomic():
            locked = (
                Dataset.objects.select_for_update().only("id", "status").get(pk=self.pk)
            )

            if locked.status != self.Status.UPLOADED:
                return False

            locked.status = self.Status.PROCESSING
            locked.save(update_fields=["status"])

        return True

    def mark_parsed(self, schema: dict | None = None):
        self.status = self.Status.PARSED
        if schema is not None:
            self.schema = schema
        self.save(update_fields=["status", "schema"])

    def mark_failed(self, error: Exception):
        self.status = self.Status.FAILED
        self.schema = {"error": str(error)}
        self.save(update_fields=["status", "schema"])


class DataPoint(models.Model):
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="data_points",
    )
    time = models.CharField(max_length=50)
    value = models.FloatField()
    series = models.CharField(max_length=255, blank=True)
    row_index = models.IntegerField()

    class Meta:
        indexes = [
            models.Index(fields=["dataset", "time"]),
        ]
