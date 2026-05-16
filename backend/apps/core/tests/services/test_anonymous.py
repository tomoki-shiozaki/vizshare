import uuid
from uuid import UUID

from django.test import RequestFactory

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME
from apps.core.services.anonymous import get_or_create_anonymous_id


class TestGetOrCreateAnonymousId:
    def setup_method(self):
        self.factory = RequestFactory()

    def test_returns_existing_anonymous_id_from_cookie(self):
        request = self.factory.get("/")

        existing_id = uuid.uuid4()

        request.COOKIES[ANONYMOUS_ID_COOKIE_NAME] = str(existing_id)

        anonymous_id, created = get_or_create_anonymous_id(request)

        assert anonymous_id == existing_id
        assert created is False

    def test_generates_new_anonymous_id_when_cookie_missing(self):
        request = self.factory.get("/")

        anonymous_id, created = get_or_create_anonymous_id(request)

        assert isinstance(anonymous_id, UUID)
        assert created is True
