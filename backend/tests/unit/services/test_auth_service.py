import pytest
from app.domain.services.auth_service import authenticate_user
from app.core.exceptions import UnauthorizedError


def test_authenticate_user_success(mocker):
    session = mocker.Mock()
    user = mocker.Mock(
        hashed_password="hashed",
        email_confirmed=True,
        is_active=True
    )

    mocker.patch(
        "app.domain.services.auth_service.get_user_by_email",
        return_value=user
    )
    mocker.patch(
        "app.domain.services.auth_service.verify_password",
        return_value=True
    )

    result = authenticate_user(session, "test@test.com", "password")

    assert result == user


def test_authenticate_user_email_not_confirmed(mocker):
    session = mocker.Mock()
    user = mocker.Mock(
        hashed_password="hashed",
        email_confirmed=False,
        is_active=True
    )

    mocker.patch(
        "app.domain.services.auth_service.get_user_by_email",
        return_value=user
    )
    mocker.patch(
        "app.domain.services.auth_service.verify_password",
        return_value=True
    )

    with pytest.raises(UnauthorizedError):
        authenticate_user(session, "test@test.com", "password")