from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from ..models.token import Token
from ..core.db import get_session
from sqlmodel import Session
from ..core.auth import authenticate_user, create_access_token
from datetime import timedelta
from ..core.config import settings

router = APIRouter(
    prefix="/login",
    tags=["login"])

@router.post("/token")
async def login_for_access_token(*, session: Session = Depends(get_session), form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
            )
    return Token(access_token=create_access_token(user.id, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)))