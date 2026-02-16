"""
Celery が無い環境でも安全に shared_task を使えるようにするラッパー
"""

from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

try:
    from celery import shared_task as _shared_task
except ImportError:
    # Celeryがない環境（Cloud Runなど）
    def _shared_task(func: F) -> F:
        return func


shared_task = _shared_task
