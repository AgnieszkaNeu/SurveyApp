from app.domain.services.user_service import create_user
from fastapi import HTTPException
import pytest
from app.domain.services.user_service import update_user
from app.domain.services.user_service import activate_and_confirm_user


def test_create_user_email_already_exists(mocker):
    session = mocker.Mock()
    user_create = mocker.Mock(email="test@test.com", password="123")

    mocker.patch(
        "app.domain.services.user_service.user_repository.get_user_by_email",
        return_value=mocker.Mock()
    )

    with pytest.raises(HTTPException):
        create_user(session=session, user_create=user_create)

def test_update_user_hashes_password(mocker):
    session = mocker.Mock()
    user = mocker.Mock(hashed_password="old")

    user_update = mocker.Mock(password="new")

    mocker.patch(
        "app.domain.services.user_service.hash_password",
        return_value="hashed"
    )

    update_user(session=session, user=user, user_update=user_update)

    assert user.hashed_password == "hashed"


def test_activate_and_confirm_user(mocker):
    session = mocker.Mock()
    user = mocker.Mock(is_active=False, email_confirmed=False)

    mocker.patch(
        "app.domain.services.user_service.user_repository.update_user",
        return_value=user
    )

    result = activate_and_confirm_user(session=session, user=user)

    assert result.is_active is True
    assert result.email_confirmed is True
