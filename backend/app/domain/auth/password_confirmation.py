from ...core.auth import decode_jwt_token
from sqlmodel import Session
from ..repositories.user_repository import get_user_by_id
from ..services.user_service import get_user_by_email, update_user
from ...core.exceptions import NotFoundError
from ...core.mail import send_password_reset_email
from ...core.auth import create_token
from ...core.config import settings
from datetime import timedelta
from ...models.user import UserUpdate
async def initiate_password_reset(*, session: Session, email: str):
    user = get_user_by_email(session=session, email=email)
    if not user:
        raise NotFoundError("Użytkownik z tym adresem email nie istnieje")
    token = create_token(subject=user.id, expires_delta=timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES))
    link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    send_password_reset_email(to_address=email, reset_link=link)
async def complete_password_reset(*, session: Session, token: str, new_password: str):
    token_data = decode_jwt_token(token)
    if token_data.sub is not None:
        update_user_entity = UserUpdate(password=new_password)
        user = get_user_by_id(session, token_data.sub)
        update_user(session=session, user=user, user_update=update_user_entity)
