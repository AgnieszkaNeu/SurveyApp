from sqlmodel import Session, select
from ...models.user import User
import uuid


def create_user (session: Session, user: User) -> User | None:
     session.add(user)
     return user

def get_user_by_email(session: Session, email: str) -> User | None:
     try:
          return session.exec(select(User).where(User.email == email)).one()
     except:
          return None

def get_users (session: Session) -> list[User]:
     return session.exec(select(User)).all()

def delete_user (session: Session, user: User):
     session.delete(user)

def get_user_by_id(session: Session, user_id: uuid.UUID) -> User:
     return session.get(User, user_id)

def update_user(session: Session, user: User) -> User:
     session.add(user)
     return user