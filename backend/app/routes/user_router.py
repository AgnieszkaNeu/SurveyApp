from fastapi import APIRouter, Depends, HTTPException
from ..models.user import UserCreate, User, UserPublic, UserUpdate
from ..core.db import get_session
from sqlmodel import Session
from fastapi import APIRouter, Depends
from typing import Annotated
from ..core.auth import get_current_user
from ..logic.service import user_service


router = APIRouter (
    prefix = "/user",
    tags = ["user"]
)

@router.get("/all_users", response_model=list[UserPublic])
def get_users(*, session: Session = Depends(get_session)):
    return user_service.get_users(session=session)


@router.get("/", response_model=UserPublic)
def get_user(*, user: Annotated[User, Depends(get_current_user)]):
    return user


@router.post("/")
def create_user(*, session: Session = Depends(get_session), user: UserCreate):
    user_service.create_user(session=session, user_create=user)


@router.delete("/")
def delete_user(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)]):
    user_service.delete_user(session=session, user=user)


@router.patch("/update_user")
def update_user(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)], user_update: UserUpdate):
    user_service.update_user(session=session, user=user, user_update=user_update)

