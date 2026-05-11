import uuid


def get_or_create_anonymous_id(request) -> tuple[str, bool]:
    anon_id = request.COOKIES.get("anonymous_id")

    created = False

    if anon_id is None:
        anon_id = str(uuid.uuid4())
        created = True

    return anon_id, created
