from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .config import settings
from ..models.token import TokenPayload
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session
from .db import get_session
from ..models.user import User
from ..logic.user_crud import get_user_by_email
from ..core.password_utils import verify_password
from datetime import timedelta, datetime, timezone
from ..logic.user_crud import get_user_by_id



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(*, session: Session = Depends(get_session), token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenPayload(**payload)
    except(InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    user = get_user_by_id(session,token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


def get_superuser(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)]):
    if user.role == "superuser":
        return user
    raise HTTPException(status_code=403, detail="You do not have permission to access this resource")


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(subject: str, expires_delta: timedelta | None = None):
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
