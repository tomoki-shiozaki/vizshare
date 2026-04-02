from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

try:
    from drf_spectacular.utils import extend_schema
except ModuleNotFoundError:
    # drf-spectacular が無い環境でも安全にするためのダミー(本番環境など)
    def extend_schema(*args, **kwargs) -> Callable[[F], F]:
        def decorator(func: F) -> F:
            return func

        return decorator


def schema(
    *,
    summary: str,
    description: str = "",
    tags: list[str] | None = None,
    responses: Any = None,
):
    """
    extend_schema を簡略化するための共通ヘルパー
    """
    kwargs: dict[str, Any] = {
        "summary": summary,
        "description": description,
    }

    if tags is not None:
        kwargs["tags"] = tags

    if responses is not None:
        kwargs["responses"] = responses

    return extend_schema(**kwargs)
