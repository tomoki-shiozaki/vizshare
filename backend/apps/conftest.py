import uuid

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME
from apps.dataset.models import DataPoint, Dataset
from apps.dataset.services.ingestion.csv_parser import parse_row_time

User = get_user_model()


# =========================
# User fixtures
# =========================


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        password="pass",
    )


@pytest.fixture
def another_user(db):
    return User.objects.create_user(
        username="otheruser",
        password="pass",
    )


# =========================
# API client fixtures
# =========================


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def anonymous_api_client(api_client, anonymous_id):
    api_client.cookies[ANONYMOUS_ID_COOKIE_NAME] = str(anonymous_id)
    return api_client


# =========================
# Anonymous ID fixtures
# =========================


@pytest.fixture
def anonymous_id():
    return uuid.uuid4()


@pytest.fixture
def another_anonymous_id():
    return uuid.uuid4()


# =========================
# Dataset fixtures
# =========================


@pytest.fixture
def dataset(user):
    return Dataset.objects.create(
        name="Test Dataset",
        owner=user,
        schema={
            "time": "time_col",
            "metrics": ["value"],
        },
    )


@pytest.fixture
def anonymous_dataset(anonymous_id):
    return Dataset.objects.create(
        name="Anonymous Dataset",
        anonymous_id=anonymous_id,
        schema={
            "time": "timestamp",
            "metrics": ["value"],
        },
    )


@pytest.fixture
def another_anonymous_dataset(another_anonymous_id):
    return Dataset.objects.create(
        name="Another Anonymous Dataset",
        anonymous_id=another_anonymous_id,
        schema={
            "time": "timestamp",
            "metrics": ["value"],
        },
    )


# =========================
# DataPoint fixtures
# =========================


@pytest.fixture
def dataset_with_points(dataset):
    DataPoint.objects.create(
        dataset=dataset,
        entity="A",
        metric="value",
        raw_time="2026-03-13T00:00:00Z",
        time=parse_row_time("2026-03-13T00:00:00Z"),
        value=1,
        order_index=0,
    )

    DataPoint.objects.create(
        dataset=dataset,
        entity="A",
        metric="anomaly",
        raw_time="2026-03-13T00:00:00Z",
        time=parse_row_time("2026-03-13T00:00:00Z"),
        value=0.1,
        order_index=1,
    )

    DataPoint.objects.create(
        dataset=dataset,
        entity="B",
        metric="value",
        raw_time="2026-03-13T01:00:00Z",
        time=parse_row_time("2026-03-13T01:00:00Z"),
        value=2,
        order_index=0,
    )

    return dataset
