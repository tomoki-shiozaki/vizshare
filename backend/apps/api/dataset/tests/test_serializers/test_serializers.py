from django.core.files.uploadedfile import SimpleUploadedFile

from apps.api.dataset.serializers import DatasetUploadSerializer


def make_file():
    return SimpleUploadedFile(
        "test.csv",
        b"timestamp,user_id,sales\n2024-01-01,1,100\n",
        content_type="text/csv",
    )


def test_schema_validation_success():
    serializer = DatasetUploadSerializer(
        data={
            "name": "test",
            "source_file": make_file(),
            "schema": {
                "time": "timestamp",
                "entity": "user_id",
                "metrics": ["sales"],
            },
        }
    )

    assert serializer.is_valid()


def test_schema_missing_time():
    serializer = DatasetUploadSerializer(
        data={
            "name": "test",
            "source_file": make_file(),
            "schema": {"metrics": ["sales"]},
        }
    )

    assert not serializer.is_valid()
    assert "schema" in serializer.errors
