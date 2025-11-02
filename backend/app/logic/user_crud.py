from sqlmodel import Session, select
from datetime import datetime, timezone
from ..models.user import UserCreate, User, UserPublic
from ..core.password_utils import hash_password


def create_user (session: Session, user_create: UserCreate) -> User:
     user = User.model_validate(
          user_create, 
          update = {
               "hashed_password": hash_password(user_create.password),
               "created_at": datetime.now(timezone.utc)
               }
          )

     session.add(user)
     session.commit()
     session.refresh(user)
     
     return user


def get_user_by_email(session: Session, email: str) -> User | None:
     try:
          return session.exec(select(User).where(User.email == email)).one()
     except:
          return None


def get_users (session: Session) -> list[UserPublic]:
     users = session.exec(select(User)).all()
     return [UserPublic.model_validate(user) for user in users]


def delete_user (session: Session, user: User):
     session.delete(user)
     session.commit()