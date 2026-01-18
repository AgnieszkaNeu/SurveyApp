from sqlmodel import Session
from ...models.submission import SubmissionCreate, Submission
from ...models.submission_fingerprint import SubmissionFingerprint
from .answer_service import submit_answers, validate_answers_creation
from ...core.transaction import transactional
from ..repositories import submission_repository
from ..services.question_service import get_questions_by_survey_id
from fastapi import HTTPException
from ...core.exceptions import SurveyModifiedException
import uuid
import hashlib
from typing import Optional
from datetime import datetime, timedelta


def check_already_submitted(
    *,
    session: Session,
    survey_id: uuid.UUID,
    fingerprint_data: dict
) -> bool:
    survey = submission_repository.get_survey_by_id(session=session, survey_id=survey_id)
    if not survey:
        return False
    if not survey.prevent_duplicates:
        return False
    if fingerprint_data.get('fingerprint_advanced'):
        fingerprint_string = f"{fingerprint_data['fingerprint_advanced']}|{fingerprint_data['survey_id']}"
    else:
        fingerprint_string = f"{fingerprint_data['ip']}|{fingerprint_data['user_agent']}|{fingerprint_data['survey_id']}"
    fingerprint_hash = hashlib.sha256(fingerprint_string.encode()).hexdigest()
    return submission_repository.check_fingerprint_exists(
        session=session,
        survey_id=survey_id,
        fingerprint_hash=fingerprint_hash
    )


def submit_submission(
    *,
    session: Session,
    submission_create: SubmissionCreate,
    fingerprint_data: dict
):
    try:
        survey = submission_repository.get_survey_by_id(
            session=session, 
            survey_id=submission_create.survey_id
        )
        if not survey:
            raise HTTPException(status_code=404, detail="Ankieta nie została znaleziona")
        if survey.status == 'expired':
            raise HTTPException(
                status_code=410,
                detail="Ta ankieta wygasła i nie można już jej wypełnić"
            )
        questions = get_questions_by_survey_id(session=session, survey_id=submission_create.survey_id)
        validate_answers_creation(
            answers_create=submission_create.answers,
            questions=questions
        )
        if survey.prevent_duplicates:
            if fingerprint_data.get('fingerprint_advanced'):
                fingerprint_string = f"{fingerprint_data['fingerprint_advanced']}|{fingerprint_data['survey_id']}"
            else:
                fingerprint_string = f"{fingerprint_data['ip']}|{fingerprint_data['user_agent']}|{fingerprint_data['survey_id']}"
            fingerprint_hash = hashlib.sha256(fingerprint_string.encode()).hexdigest()
            if submission_repository.check_fingerprint_exists(
                session=session,
                survey_id=submission_create.survey_id,
                fingerprint_hash=fingerprint_hash
            ):
                raise HTTPException(
                    status_code=409,
                    detail="Już wypełniłeś tę ankietę. Wielokrotne przesyłanie jest zablokowane."
                )
            new_fingerprint = SubmissionFingerprint(
                survey_id=submission_create.survey_id,
                fingerprint_hash=fingerprint_hash
            )
            submission_repository.create_fingerprint(session=session, fingerprint=new_fingerprint)
            session.commit()
        submission = Submission.model_validate(
            submission_create.model_dump(exclude={"answers"})
        )
        created_submission = submission_repository.create_submission(session=session, submission=submission)
        answers = submission_create.answers
        submit_answers(
            session=session,
            answers_create=answers,
            submission_id=created_submission.id
        )
        survey.submission_count += 1
        if survey.submission_count == 1:
            survey.is_locked = True
            survey.locked_at = datetime.utcnow()
        session.add(survey)
        session.commit()
        return created_submission
    except (HTTPException, SurveyModifiedException):
        raise
    except Exception as e:
        session.rollback()
        raise
@transactional()


def get_survey_submissions(*, session: Session, survey_id: uuid.UUID):
    return submission_repository.get_all_survey_submissions(session=session, survey_id=survey_id)
