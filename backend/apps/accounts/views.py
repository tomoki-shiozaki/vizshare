from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.serializers import JWTSerializer
from rest_framework.throttling import AnonRateThrottle
from drf_spectacular.utils import extend_schema


class LoginThrottle(AnonRateThrottle):
    rate = "5/min"


class RegisterThrottle(AnonRateThrottle):
    rate = "5/min"


class CustomLoginView(LoginView):
    throttle_classes = [LoginThrottle]

    @extend_schema(responses=JWTSerializer)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CustomRegisterView(RegisterView):
    throttle_classes = [RegisterThrottle]

    @extend_schema(responses=JWTSerializer)
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
