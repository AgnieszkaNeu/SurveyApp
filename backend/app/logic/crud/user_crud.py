from sqlmodel import Session, select
from datetime import datetime, timezone
from ...models.user import UserCreate, User, UserPublic, UserUpdate
from ...core.password_utils import hash_password
from sqlalchemy.exc import IntegrityError
import uuid
from ...core.exceptions import EmailAlreadyExistsException


def create_user (session: Session, user_create: UserCreate) -> User | None:
     user = User.model_validate(
          user_create, 
          update = {
               "hashed_password": hash_password(user_create.password),
               "created_at": datetime.now(timezone.utc)
               }
          )
     session.add(user)
     try:
          session.commit()
          session.refresh(user)
          return user
     except IntegrityError as e:
          session.rollback()
          raise EmailAlreadyExistsException("Email already exists.")


def get_user_by_email(session: Session, email: str) -> User | None:
     try:
          return session.exec(select(User).where(User.email == email)).one()
     except:
          return None


def get_users (session: Session) -> list[User]:
     return session.exec(select(User)).all()


def delete_user (session: Session, user: User):
     session.delete(user)
     session.commit()


def get_user_by_id(session: Session, user_id: uuid.UUID) -> User:
     return session.get(User, user_id)


def update_user(session: Session, user: User, user_update: UserUpdate) -> User:
     if user_update.email:
          user.email = user_update.email
     if user_update.password:
          user.hashed_password = hash_password(user_update.password)

     session.add(user)
     try:
          session.commit()
          session.refresh(user)
          return user
     except IntegrityError as e:
          session.rollback()
          raise EmailAlreadyExistsException("Email already exist.")