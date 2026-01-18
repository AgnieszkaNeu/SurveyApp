from ...core.auth import decode_jwt_token
from sqlmodel import Session
from ..repositories.user_repository import get_user_by_id
from ..services.user_service import get_user_by_email, activate_and_confirm_user
from ...core.exceptions import NotFoundError
from ...core.mail import send_confirmation_email
from ...core.auth import create_token
from ...core.config import settings
from datetime import timedelta
async def initiate_email_confirmation(*, session: Session, email: str):
    user = get_user_by_email(session=session, email=email)
    if not user:
        raise NotFoundError("Użytkownik z tym adresem email nie istnieje")
    token = create_token(subject=user.id, expires_delta=timedelta(minutes=settings.CONFIRMATION_TOKEN_EXPIRE_MINUTES))
    link = f"{settings.FRONTEND_URL}/auth/confirm-email?token={token}"
    send_confirmation_email(to_address=email, confirmation_link=link)
async def complete_email_confirmation(*, session: Session, token: str):
    token_data = decode_jwt_token(token)
    if token_data.sub is not None:
        user = get_user_by_id(session, token_data.sub)
        activate_and_confirm_user(session=session, user=user)
