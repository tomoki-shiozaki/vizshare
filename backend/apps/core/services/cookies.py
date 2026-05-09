from django.conf import settings


def set_anonymous_cookie(response, anonymous_id: str, created: bool):
    if not created:
        return response

    response.set_cookie(
        "anonymous_id",
        anonymous_id,
        max_age=settings.COOKIE_MAX_AGE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )
    return response
