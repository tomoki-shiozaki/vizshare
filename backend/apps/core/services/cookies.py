from uuid import UUID

from django.conf import settings

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME


def set_anonymous_cookie(
    response,
    anonymous_id: UUID,
    created: bool,
):
    if not created:
        return response

    response.set_cookie(
        ANONYMOUS_ID_COOKIE_NAME,
        str(anonymous_id),
        max_age=settings.COOKIE_MAX_AGE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )

    return response
