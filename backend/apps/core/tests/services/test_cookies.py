import uuid

from django.http import HttpResponse

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME
from apps.core.services.cookies import set_anonymous_cookie


class TestSetAnonymousCookie:
    def test_sets_cookie_when_created(self, settings):
        settings.COOKIE_MAX_AGE = 3600
        settings.COOKIE_SAMESITE = "Lax"
        settings.COOKIE_SECURE = True

        anonymous_id = uuid.uuid4()

        response = HttpResponse()

        response = set_anonymous_cookie(
            response=response,
            anonymous_id=anonymous_id,
            created=True,
        )

        cookie = response.cookies[ANONYMOUS_ID_COOKIE_NAME]

        assert cookie.value == str(anonymous_id)
        assert cookie["max-age"] == 3600
        assert cookie["samesite"] == "Lax"
        assert cookie["secure"]

    def test_does_not_set_cookie_when_not_created(self):
        anonymous_id = uuid.uuid4()

        response = HttpResponse()

        response = set_anonymous_cookie(
            response=response,
            anonymous_id=anonymous_id,
            created=False,
        )

        assert ANONYMOUS_ID_COOKIE_NAME not in response.cookies
