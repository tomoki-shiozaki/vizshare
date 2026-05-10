from django.http import HttpResponse

from apps.core.services.cookies import set_anonymous_cookie


class TestSetAnonymousCookie:
    def test_sets_cookie_when_created(self, settings):
        settings.COOKIE_MAX_AGE = 3600
        settings.COOKIE_SAMESITE = "Lax"
        settings.COOKIE_SECURE = True

        response = HttpResponse()

        response = set_anonymous_cookie(
            response=response,
            anonymous_id="anon-123",
            created=True,
        )

        cookie = response.cookies["anonymous_id"]

        assert cookie.value == "anon-123"
        assert cookie["max-age"] == 3600
        assert cookie["samesite"] == "Lax"
        assert cookie["secure"]

    def test_does_not_set_cookie_when_not_created(self):
        response = HttpResponse()

        response = set_anonymous_cookie(
            response=response,
            anonymous_id="anon-123",
            created=False,
        )

        assert "anonymous_id" not in response.cookies
