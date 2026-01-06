from fastapi import Depends
from sqlalchemy.orm import Session
from ..core.db import get_session
from ..core.auth import get_current_user
from ..models.user import User
from .repositories.survey_repository import get_survey_by_id
import uuid
from ..core.transaction import transactional
from ..core.exceptions import AccessDeniedError

@transactional()
def survey_owner_required(*, session: Session = Depends(get_session), user: User = Depends(get_current_user), survey_id: uuid.UUID):
    survey = get_survey_by_id(session, survey_id)
    if survey.user_id != user.id:
        raise AccessDeniedError(message="Not enough permissions")
    
    return survey