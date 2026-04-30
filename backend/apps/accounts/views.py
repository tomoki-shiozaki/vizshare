from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from rest_framework.throttling import AnonRateThrottle


class LoginThrottle(AnonRateThrottle):
    rate = "5/min"


class RegisterThrottle(AnonRateThrottle):
    rate = "5/min"


class CustomLoginView(LoginView):
    throttle_classes = [LoginThrottle]


class CustomRegisterView(RegisterView):
    throttle_classes = [RegisterThrottle]
