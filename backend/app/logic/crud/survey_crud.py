from sqlmodel import Session, select
from ...models.survey import Survey, SurveyCreate
from datetime import datetime, timezone, timedelta
import uuid

def get_survey_by_id(session: Session, survey_id: uuid.UUID) -> Survey | None:
    return session.get(Survey, survey_id)


def create_survey(session: Session, 
                  survey_create: SurveyCreate, 
                  user_id: uuid.UUID
                  ) -> Survey:
    
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
    
    session.add(survey)
    session.commit()
    session.refresh(survey)

    return survey


def get_all_user_surveys(session: Session, user_id: uuid.UUID) -> list[Survey] | None:
    return session.exec(select(Survey).where(Survey.user_id == user_id)).all()


def get_survey_by_name(session: Session, name: str) -> list[Survey] | None:
    return session.exec(select(Survey).where(Survey.name == name)).all()
