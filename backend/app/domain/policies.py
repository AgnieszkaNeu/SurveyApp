from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_session
from ..api.authenticate_user import get_current_user
from ..models.user import User
from .services import survey_service
import uuid
from ..core.exceptions import AccessDeniedError


def survey_owner_required(
    survey_id: uuid.UUID,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    try:
        survey = survey_service.get_survey_for_owner(
            session=session, 
            survey_id=survey_id, 
            user_id=user.id
        )
        return survey
    except AccessDeniedError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ankieta nie została znaleziona"
        )
