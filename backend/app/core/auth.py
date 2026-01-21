from typing import Optional
import jwt
from .config import settings
from ..models.token import TokenPayload
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from datetime import timedelta, datetime, timezone
from .exceptions import TokenExpiredException, InvalidTokenException


def decode_jwt_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require": ["exp", "sub"]} 
        )
        return TokenPayload(**payload)
    except ExpiredSignatureError:
        raise TokenExpiredException()
    except (InvalidTokenError, ValueError):
        raise InvalidTokenException()


def create_token(subject: str, expires_delta: Optional[timedelta] = None):
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=15)
    )
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
