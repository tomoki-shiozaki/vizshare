from dj_rest_auth.views import LoginView
from rest_framework.throttling import AnonRateThrottle


class LoginThrottle(AnonRateThrottle):
    rate = "5/min"


class CustomLoginView(LoginView):
    throttle_classes = [LoginThrottle]
