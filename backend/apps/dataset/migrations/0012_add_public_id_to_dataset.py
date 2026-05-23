import uuid

from django.db import migrations


def fill_public_id(apps, schema_editor):
    Dataset = apps.get_model("dataset", "Dataset")

    for d in Dataset.objects.filter(public_id__isnull=True):
        d.public_id = uuid.uuid4()
        d.save(update_fields=["public_id"])


class Migration(migrations.Migration):

    dependencies = [
        ("dataset", "0011_dataset_public_id"),
    ]

    operations = [
        migrations.RunPython(fill_public_id),
    ]
