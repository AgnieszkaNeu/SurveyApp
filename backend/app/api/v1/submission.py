from fastapi import APIRouter, Depends
from ...models.submission import SubmissionCreate, SubmissionPublic
from ...core.db import get_session
from sqlmodel import Session
from fastapi import APIRouter, Depends
from ...domain.services import submission_service
from ...domain.policies import survey_owner_required

router = APIRouter (
    prefix = "/submissions",
    tags = ["submission"]
)

@router.post("/")
def submit_submission(*, session: Session = Depends(get_session), submission_create: SubmissionCreate):
    return submission_service.submit_submission(session = session, submission_create = submission_create)


@router.get("/survey/{survey_id}", response_model=list[SubmissionPublic])
def get_all_survey_submissions(*, session: Session = Depends(get_session), survey = Depends(survey_owner_required)):
    return submission_service.get_survey_submissions(session = session, survey_id = survey.id)