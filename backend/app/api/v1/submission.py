from fastapi import APIRouter, Depends, HTTPException, Request
from ...models.submission import SubmissionCreate, SubmissionPublic
from ...core.db import get_session
from sqlmodel import Session
from ...domain.services import submission_service
from ...domain.policies import survey_owner_required
from pydantic import BaseModel
from typing import Optional
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)
router = APIRouter (
    prefix = "/submissions",
    tags = ["submission"]
)


class CheckDuplicateRequest(BaseModel):
    fingerprint_advanced: Optional[str] = None
@router.post("/check-duplicate/{survey_id}")

def check_duplicate_submission(
    *,
    survey_id: uuid.UUID,
    request: Request,
    body: CheckDuplicateRequest,
    session: Session = Depends(get_session)
):
    fingerprint_data = {
        'ip': request.client.host if request.client else 'unknown',
        'user_agent': request.headers.get('user-agent', ''),
        'survey_id': str(survey_id),
        'fingerprint_advanced': body.fingerprint_advanced
    }
    already_submitted = submission_service.check_already_submitted(
        session=session,
        survey_id=survey_id,
        fingerprint_data=fingerprint_data
    )
    return {"already_submitted": already_submitted}
@router.post("/")
@limiter.limit("10/minute")

def submit_submission(
    *,
    request: Request,
    session: Session = Depends(get_session),
    submission_create: SubmissionCreate = None
):
    fingerprint_data = {
        'ip': request.client.host if request.client else 'unknown',
        'user_agent': request.headers.get('user-agent', ''),
        'survey_id': str(submission_create.survey_id),
        'fingerprint_advanced': submission_create.fingerprint_advanced
    }
    return submission_service.submit_submission(
        session=session,
        submission_create=submission_create,
        fingerprint_data=fingerprint_data
    )
@router.get("/survey/{survey_id}", response_model=list[SubmissionPublic])

def get_all_survey_submissions(*, session: Session = Depends(get_session), survey = Depends(survey_owner_required)):
    return submission_service.get_survey_submissions(session = session, survey_id = survey.id)
