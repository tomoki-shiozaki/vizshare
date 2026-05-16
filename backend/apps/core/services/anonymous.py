import uuid

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME


def get_anonymous_id(request) -> str | None:
    return request.COOKIES.get(ANONYMOUS_ID_COOKIE_NAME)


def get_or_create_anonymous_id(request) -> tuple[str, bool]:
    anon_id = get_anonymous_id(request)

    created = False

    if anon_id is None:
        anon_id = str(uuid.uuid4())
        created = True

    return anon_id, created
