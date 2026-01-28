import pytest
from datetime import timedelta

from app.core.auth import create_token, decode_jwt_token
from app.core.exceptions import TokenExpiredException, InvalidTokenException


def test_create_and_decode_jwt_token():
    token = create_token(subject="user123")

    payload = decode_jwt_token(token)

    assert payload.sub == "user123"
    assert payload.exp is not None


def test_jwt_token_expired():
    token = create_token(
        subject="user123",
        expires_delta=timedelta(seconds=-5)
    )

    with pytest.raises(TokenExpiredException):
        decode_jwt_token(token)


def test_jwt_token_invalid():
    with pytest.raises(InvalidTokenException):
        decode_jwt_token("this.is.not.a.jwt")
