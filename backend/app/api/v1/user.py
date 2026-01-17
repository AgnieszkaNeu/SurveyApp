from fastapi import APIRouter, Depends, Request
from ...models.user import UserCreate, User, UserPublic, UserUpdate
from ...core.db import get_session
from sqlmodel import Session
from typing import Annotated
from ..authenticate_user import get_current_user, get_superuser
from ...domain.services import user_service
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)
router = APIRouter (
    prefix = "/user",
    tags = ["user"]
)
@router.get("/all_users", response_model=list[UserPublic])


def get_users(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_superuser)]):
    return user_service.get_users(session=session)
@router.get("/", response_model=UserPublic)


def get_user(*, user: Annotated[User, Depends(get_current_user)]):
    return user
@router.post("/", response_model=UserPublic)
@limiter.limit("3/hour")


def create_user(request: Request, session: Session = Depends(get_session), user: UserCreate = None):
    return user_service.create_user(session=session, user_create=user)
@router.delete("/")


def delete_user(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)]):
    user_service.delete_user(session=session, user=user)
@router.patch("/update_user")


def update_user(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)], user_update: UserUpdate):
    user_service.update_user(session=session, user=user, user_update=user_update)
