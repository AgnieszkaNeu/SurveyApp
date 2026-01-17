from typing import Optional
from sqlmodel import Session
from ...models.user import User
from ..repositories.user_repository import get_user_by_email
from ...core.password_hashing import verify_password
from ...core.exceptions import UnauthorizedError


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(session, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    if user.email_confirmed is False:
        raise UnauthorizedError("Email nie został potwierdzony")
    if user.is_active is False:
        raise UnauthorizedError("Użytkownik nie jest aktywny")
    return user
