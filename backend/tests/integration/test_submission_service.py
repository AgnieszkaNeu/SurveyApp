import uuid
from app.domain.services.submission_service import submit_submission
from app.models.survey import Survey, StatusEnum
from app.models.submission import SubmissionCreate
from datetime import datetime, timezone, timedelta
from app.domain.services.submission_service import get_survey_submissions


def test_submit_submission_integration(session):

    survey = Survey(
        name="Survey",
        status=StatusEnum.public,
        prevent_duplicates=False,
        created_at=datetime.now(timezone.utc),
        last_updated=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        submission_count=0,
        user_id=uuid.uuid4()
    )

    session.add(survey)
    session.commit()

    submission_create = SubmissionCreate(
        survey_id=survey.id,
        answers=[]
    )

    submission = submit_submission(
        session=session,
        submission_create=submission_create,
        fingerprint_data={}
    )

    assert submission.id is not None

    session.refresh(survey)
    assert survey.submission_count == 1
    assert survey.is_locked is True

def test_get_survey_submissions_integration(session):
    submissions = get_survey_submissions(
        session=session,
        survey_id=uuid.uuid4()
    )

    assert submissions == []
