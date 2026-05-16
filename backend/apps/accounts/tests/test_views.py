import uuid
from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.core.constants import ANONYMOUS_ID_COOKIE_NAME

# =========================
# TEST CLASS
# =========================


@pytest.mark.django_db
class TestAuthAnonymousDatasetTransfer:

    # =========================
    # LOGIN
    # =========================

    @patch("apps.accounts.views.transfer_anonymous_datasets_to_user")
    def test_login_transfers_anonymous_datasets(
        self,
        mock_transfer,
        api_client,
        user,
        anonymous_dataset,
        anonymous_id,
    ):
        url = reverse("custom_rest_login")

        api_client.cookies[ANONYMOUS_ID_COOKIE_NAME] = str(anonymous_id)

        response = api_client.post(
            url,
            {
                "username": "testuser",
                "password": "pass",
            },
            format="json",
        )

        assert response.status_code == 200

        mock_transfer.assert_called_once_with(
            anonymous_id=anonymous_id,
            user=user,
        )

    @patch("apps.accounts.views.transfer_anonymous_datasets_to_user")
    def test_login_without_anonymous_id_does_not_transfer(
        self,
        mock_transfer,
        api_client,
        user,
    ):
        url = reverse("custom_rest_login")

        response = api_client.post(
            url,
            {
                "username": "testuser",
                "password": "pass",
            },
            format="json",
        )

        assert response.status_code == 200
        mock_transfer.assert_not_called()

    @patch("apps.accounts.views.transfer_anonymous_datasets_to_user")
    def test_cookie_is_deleted_after_login(
        self,
        mock_transfer,
        api_client,
        user,
        anonymous_id,
    ):
        url = reverse("custom_rest_login")

        api_client.cookies[ANONYMOUS_ID_COOKIE_NAME] = str(anonymous_id)

        response = api_client.post(
            url,
            {
                "username": "testuser",
                "password": "pass",
            },
            format="json",
        )

        assert response.status_code == 200

        # cookie削除確認（Djangoテストクライアント仕様）
        assert ANONYMOUS_ID_COOKIE_NAME in response.cookies
        assert response.cookies[ANONYMOUS_ID_COOKIE_NAME].value == ""
