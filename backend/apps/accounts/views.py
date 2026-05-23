from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.serializers import JWTSerializer
from dj_rest_auth.views import LoginView
from rest_framework.throttling import AnonRateThrottle

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME
from apps.core.services.anonymous import get_anonymous_id
from apps.dataset.services.application.transfer_dataset_ownership import (
    transfer_anonymous_datasets_to_user,
)
from utils.schema import schema


class LoginThrottle(AnonRateThrottle):
    rate = "5/min"


class RegisterThrottle(AnonRateThrottle):
    rate = "5/min"


# =========================
# LOGIN
# =========================


class CustomLoginView(LoginView):
    throttle_classes = [LoginThrottle]

    @schema(
        summary="ログイン",
        responses=JWTSerializer,
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        self._after_login(request, response)

        return response

    def _after_login(self, request, response):
        self._handle_post_login(request)
        self._clear_anonymous_cookie(response)

    def _handle_post_login(self, request):
        anonymous_id = get_anonymous_id(request)

        if anonymous_id:
            transfer_anonymous_datasets_to_user(
                anonymous_id=anonymous_id,
                user=request.user,
            )

    def _clear_anonymous_cookie(self, response):
        response.delete_cookie(ANONYMOUS_ID_COOKIE_NAME)


# =========================
# REGISTER
# =========================


class CustomRegisterView(RegisterView):
    throttle_classes = [RegisterThrottle]

    @schema(
        summary="ユーザー登録",
        responses=JWTSerializer,
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
