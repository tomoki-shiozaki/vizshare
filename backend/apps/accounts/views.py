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
        return super().post(request, *args, **kwargs)

    def login(self):
        super().login()

        anonymous_id = get_anonymous_id(self.request)

        if anonymous_id:
            transfer_anonymous_datasets_to_user(
                anonymous_id=anonymous_id,
                user=self.user,
            )

    def get_response(self):
        response = super().get_response()

        response.delete_cookie(ANONYMOUS_ID_COOKIE_NAME)

        return response


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

    def perform_create(self, serializer):
        user = super().perform_create(serializer)

        anonymous_id = get_anonymous_id(self.request)

        if anonymous_id:
            transfer_anonymous_datasets_to_user(
                anonymous_id=anonymous_id,
                user=user,
            )

        return user
