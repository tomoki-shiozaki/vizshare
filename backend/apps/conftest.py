import uuid

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", password="pass")


@pytest.fixture
def another_user(db):
    return User.objects.create_user(username="otheruser", password="pass")


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def anonymous_id():
    return uuid.uuid4()


@pytest.fixture
def another_anonymous_id():
    return uuid.uuid4()
