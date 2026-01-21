from typing import Annotated
from fastapi import Depends, HTTPException
from ..models.token import TokenPayload
from sqlmodel import Session
from ..core.db import get_session
from ..models.user import User
from ..domain.services import user_service
from ..core.exceptions import UnauthorizedError
from ..core.auth import decode_jwt_token
from fastapi.security import OAuth2PasswordBearer
from ..core.exceptions import TokenExpiredException, InvalidTokenException
from fastapi import status
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_token_payload(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenPayload:
    try:
        return decode_jwt_token(token)
    except TokenExpiredException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token wygasł",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy token",
            headers={"WWW-Authenticate": "Bearer"},
        )
async def get_current_user(*, session: Session = Depends(get_session), token_data: TokenPayload = Depends(get_token_payload)):
    user = user_service.get_user_by_id(session=session, user_id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie został znaleziony")
    if not user.is_active:
        raise UnauthorizedError("Użytkownik nie jest aktywny")
    if user.email_confirmed is False:
        raise UnauthorizedError("Email nie został potwierdzony")
    return user


def get_superuser(user: Annotated[User, Depends(get_current_user)]):
    if user.role == "superuser":
        return user
    raise HTTPException(status_code=403, detail="Nie masz uprawnień do tego zasobu")
