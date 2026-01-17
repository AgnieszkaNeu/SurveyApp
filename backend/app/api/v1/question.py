from fastapi import APIRouter, Depends
from ...models.question import QuestionPublic, QuestionCreate
from ...core.db import get_session
from sqlmodel import Session
from ...domain.services import question_service
from ...domain.policies import survey_owner_required
router = APIRouter (
    prefix = "/question",
    tags = ["question"]
)
@router.post("/{survey_id}/", response_model = list[QuestionPublic])


def create_or_update_questions_for_survey(*, 
                                session: Session = Depends(get_session),  
                                questions: list[QuestionCreate],  
                                survey = Depends(survey_owner_required)
                                ):
    return question_service.create_or_update_questions_for_survey(session=session, questions=questions, survey=survey)
@router.get("/{survey_id}/", response_model=list[QuestionPublic])


def get_question_for_survey (*, session: Session = Depends(get_session), survey = Depends(survey_owner_required)):
    return question_service.get_all_survey_questions(session=session, survey = survey)
