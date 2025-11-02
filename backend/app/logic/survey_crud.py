from sqlmodel import Session
from ..models.survey import Survey, SurveyCreate
from ..models.question import QuestionCreate, QuestionAnswerOptionCreate, Question
from datetime import datetime, timezone
import uuid

def get_survey(session: Session, survey_id: int) -> Survey | None:
    return session.get(Survey, survey_id)


def create_survey(session: Session, 
                  survey_create: SurveyCreate, 
                  user_id: uuid.UUID) -> Survey:
    
    survey = Survey.model_validate(
        survey_create,
        update= {
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc),
            "last_updated": datetime.now(timezone.utc),
            "user_id": user_id
        }
    )
    
    session.add(survey)
    session.commit
    session.refresh(survey)

    return survey