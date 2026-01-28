from app.domain.services.auth_service import authenticate_user
from app.models.user import User
from app.core.password_hashing import hash_password
from app.core.exceptions import UnauthorizedError
import pytest
from datetime import datetime, timezone

def test_authenticate_user_success(session):
    password = "secret123"
    hashed = hash_password(password)

    user = User(
        email="test@example.com",
        created_at=datetime.now(timezone.utc),
        hashed_password=hashed,
        email_confirmed=True,
        is_active=True
    )

    session.add(user)
    session.commit()

    result = authenticate_user(
        session=session,
        email="test@example.com",
        password=password
    )

    assert result is not None
    assert result.email == "test@example.com"


def test_authenticate_user_wrong_password(session):
    user = User(
        email="test@example.com",
        created_at=datetime.now(timezone.utc),
        hashed_password=hash_password("correct-password"),
        email_confirmed=True,
        is_active=True
    )

    session.add(user)
    session.commit()

    result = authenticate_user(
        session=session,
        email="test@example.com",
        password="wrong-password"
    )

    assert result is None



def test_authenticate_user_email_not_confirmed(session):
    user = User(
        email="test@example.com",
        created_at=datetime.now(timezone.utc),
        hashed_password=hash_password("secret123"),
        email_confirmed=False,
        is_active=True
    )

    session.add(user)
    session.commit()

    with pytest.raises(UnauthorizedError):
        authenticate_user(
            session=session,
            email="test@example.com",
            password="secret123"
        )


def test_authenticate_user_not_active(session):
    user = User(
        email="test@example.com",
        created_at=datetime.now(timezone.utc),
        hashed_password=hash_password("secret123"),
        email_confirmed=True,
        is_active=False
    )

    session.add(user)
    session.commit()

    with pytest.raises(UnauthorizedError):
        authenticate_user(
            session=session,
            email="test@example.com",
            password="secret123"
        )
