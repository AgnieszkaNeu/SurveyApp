from typing import Optional
from sqlmodel import Session
from ...models.user import User, UserCreate, UserUpdate
from ..repositories import user_repository
from ...core.transaction import transactional
from ...core.password_hashing import hash_password
from datetime import datetime, timezone
from fastapi import HTTPException, status
import uuid
@transactional()


def get_users(*, session: Session) -> list[User]:
    return user_repository.get_users(session=session)
@transactional()


def create_user(*, session: Session, user_create: UserCreate) -> User:
    existing_user = user_repository.get_user_by_email(session=session, email=user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Użytkownik z tym adresem email już istnieje"
        )
    user = User.model_validate(
          user_create, 
          update = {
               "hashed_password": hash_password(user_create.password),
               "created_at": datetime.now(timezone.utc)
               }
          )
    new_user = user_repository.create_user(session=session, user=user)
    return new_user
@transactional()


def delete_user(*, session: Session, user: User):
    user_repository.delete_user(session=session, user=user)
@transactional()


def update_user(*, session: Session, user: User, user_update: UserUpdate):
    if user_update.password:
          user.hashed_password = hash_password(user_update.password)
    updated_user = user_repository.update_user(session=session, user=user)
    return updated_user
@transactional()


def activate_and_confirm_user(*, session: Session, user: User):
    user.is_active = True
    user.email_confirmed = True
    updated_user = user_repository.update_user(session=session, user=user)
    return updated_user
@transactional()


def get_user_by_email(*, session: Session, email: str) -> Optional[User]:
    return user_repository.get_user_by_email(session=session, email=email)
@transactional()


def get_user_by_id(*, session: Session, user_id: uuid.UUID) -> Optional[User]:
    return user_repository.get_user_by_id(session=session, user_id=user_id)
