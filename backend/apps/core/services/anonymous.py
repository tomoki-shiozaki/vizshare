import uuid
from uuid import UUID

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME


def get_anonymous_id(request) -> UUID | None:
    raw_id = request.COOKIES.get(ANONYMOUS_ID_COOKIE_NAME)

    if raw_id is None:
        return None

    try:
        return UUID(raw_id)
    except ValueError:
        return None


def get_or_create_anonymous_id(request) -> tuple[UUID, bool]:
    anon_id = get_anonymous_id(request)

    created = False

    if anon_id is None:
        anon_id = uuid.uuid4()
        created = True

    return anon_id, created
