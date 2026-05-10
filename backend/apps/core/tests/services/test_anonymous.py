import uuid

from django.test import RequestFactory

from apps.core.services.anonymous import get_or_create_anonymous_id


class TestGetOrCreateAnonymousId:
    def setup_method(self):
        self.factory = RequestFactory()

    def test_returns_existing_anonymous_id_from_cookie(self):
        request = self.factory.get("/")
        request.COOKIES["anonymous_id"] = "existing-anon-id"

        anonymous_id, created = get_or_create_anonymous_id(request)

        assert anonymous_id == "existing-anon-id"
        assert created is False

    def test_generates_new_anonymous_id_when_cookie_missing(self):
        request = self.factory.get("/")

        anonymous_id, created = get_or_create_anonymous_id(request)

        # UUID としてパースできることを確認
        parsed = uuid.UUID(anonymous_id)

        assert str(parsed) == anonymous_id
        assert created is True
