from sqlmodel import Session, select
from ...models.submission import Submission
from ...models.submission_fingerprint import SubmissionFingerprint
from ...models.survey import Survey
from datetime import datetime, timedelta
from typing import Optional
import uuid


def create_submission(session: Session, submission: Submission) -> Submission:
    session.add(submission)
    return submission


def get_all_survey_submissions(session: Session, survey_id: uuid.UUID) -> list[Submission]:
    statement = select(Submission).where(Submission.survey_id == survey_id)
    results = session.exec(statement)
    return results.all()


def get_survey_by_id(session: Session, survey_id: uuid.UUID) -> Optional[Survey]:
    return session.exec(
        select(Survey).where(Survey.id == survey_id)
    ).first()


def check_fingerprint_exists(session: Session, survey_id: uuid.UUID, fingerprint_hash: str) -> bool:
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    existing = session.exec(
        select(SubmissionFingerprint).where(
            SubmissionFingerprint.survey_id == survey_id,
            SubmissionFingerprint.fingerprint_hash == fingerprint_hash,
            SubmissionFingerprint.submitted_at > thirty_days_ago
        )
    ).first()
    return existing is not None


def create_fingerprint(session: Session, fingerprint: SubmissionFingerprint) -> SubmissionFingerprint:
    session.add(fingerprint)
    return fingerprint
