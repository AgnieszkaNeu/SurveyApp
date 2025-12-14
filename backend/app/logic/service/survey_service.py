from sqlmodel import Session
from ...models.survey import Survey, SurveyCreate
from ..crud import survey_crud
from ...core.transaction import transactional
from datetime import datetime, timezone, timedelta

import uuid 


@transactional(refresh_returned_instance=True)
def create_survey(*, session: Session, user_id: uuid.UUID, survey_create = SurveyCreate) -> Survey:

    if survey_create.expires_delta:
        expire = datetime.now(timezone.utc) + timedelta(minutes=survey_create.expires_delta)
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=30)

    survey = Survey()
    survey = Survey.model_validate(
        survey_create,
        update= {
            "created_at": datetime.now(timezone.utc),
            "expires_at": expire,
            "last_updated": datetime.now(timezone.utc),
            "user_id": user_id
        }
    )

    new_survey = survey_crud.create_survey(session=session, survey=survey)
    return new_survey
    

@transactional()
def get_all_user_surveys(session: Session, user_id: uuid.UUID) -> list[Survey]:
    return survey_crud.get_all_user_surveys(session=session, user_id=user_id)

    
@transactional()
def get_survey_by_name(session: Session, name: str, user_id = uuid.UUID) -> list[Survey]:
    surveys = survey_crud.get_survey_by_name(session=session, name=name)
    return [survey for survey in surveys if survey.user_id == user_id]
    
    

