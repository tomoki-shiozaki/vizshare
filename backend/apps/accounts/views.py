from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.serializers import JWTSerializer
from rest_framework.throttling import AnonRateThrottle

from utils.schema import schema


class LoginThrottle(AnonRateThrottle):
    rate = "5/min"


class RegisterThrottle(AnonRateThrottle):
    rate = "5/min"


class CustomLoginView(LoginView):
    throttle_classes = [LoginThrottle]

    @schema(
        summary="ログイン",
        responses=JWTSerializer,
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CustomRegisterView(RegisterView):
    throttle_classes = [RegisterThrottle]

    @schema(
        summary="ユーザー登録",
        responses=JWTSerializer,
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
