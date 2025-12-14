from sqlmodel import Session
from ...models.user import User, UserCreate, UserUpdate
from ..crud import user_crud
from ...core.transaction import transactional
from ...core.password_utils import hash_password
from datetime import datetime, timezone

@transactional()
def get_users(session: Session) -> list[User]:
    return user_crud.get_users(session=session)

@transactional()
def create_user(session: Session, user_create: UserCreate):
    user = User.model_validate(
          user_create, 
          update = {
               "hashed_password": hash_password(user_create.password),
               "created_at": datetime.now(timezone.utc)
               }
          )
    
    new_user = user_crud.create_user(session=session, user=user)
    return new_user


@transactional()
def delete_user(session: Session, user: User):
    user_crud.delete_user(session=session, user=user)


@transactional()
def update_user(session: Session, user: User, user_update: UserUpdate):
    if user_update.email:
          user.email = user_update.email
    if user_update.password:
          user.hashed_password = hash_password(user_update.password)

    updated_user = user_crud.update_user(session=session, user=user)
    return updated_user