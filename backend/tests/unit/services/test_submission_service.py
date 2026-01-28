from app.domain.services.submission_service import check_already_submitted
from app.domain.services.submission_service import check_already_submitted
import uuid
from app.domain.services.submission_service import check_already_submitted
from app.domain.services.submission_service import submit_submission
from fastapi import HTTPException
import pytest

def test_check_already_submitted_no_survey(mocker):
    session = mocker.Mock()

    mocker.patch(
        "app.domain.services.submission_service.submission_repository.get_survey_by_id",
        return_value=None
    )

    result = check_already_submitted(
        session=session,
        survey_id=uuid.uuid4(),
        fingerprint_data={}
    )

    assert result is False


def test_check_already_submitted_duplicates_disabled(mocker):
    session = mocker.Mock()
    survey = mocker.Mock(prevent_duplicates=False)

    mocker.patch(
        "app.domain.services.submission_service.submission_repository.get_survey_by_id",
        return_value=survey
    )

    result = check_already_submitted(
        session=session,
        survey_id=uuid.uuid4(),
        fingerprint_data={}
    )

    assert result is False

def test_check_already_submitted_fingerprint_exists(mocker):
    session = mocker.Mock()
    survey = mocker.Mock(prevent_duplicates=True)

    mocker.patch(
        "app.domain.services.submission_service.submission_repository.get_survey_by_id",
        return_value=survey
    )
    mocker.patch(
        "app.domain.services.submission_service.submission_repository.check_fingerprint_exists",
        return_value=True
    )

    result = check_already_submitted(
        session=session,
        survey_id=uuid.uuid4(),
        fingerprint_data={
            "ip": "127.0.0.1",
            "user_agent": "pytest",
            "survey_id": "123"
        }
    )

    assert result is True


def test_submit_submission_expired_survey(mocker):
    session = mocker.Mock()
    submission_create = mocker.Mock(survey_id=uuid.uuid4())

    survey = mocker.Mock(status="expired")

    mocker.patch(
        "app.domain.services.submission_service.submission_repository.get_survey_by_id",
        return_value=survey
    )

    with pytest.raises(HTTPException) as exc:
        submit_submission(
            session=session,
            submission_create=submission_create,
            fingerprint_data={}
        )

    assert exc.value.status_code == 410

def test_submit_submission_duplicate_detected(mocker):
    session = mocker.Mock()
    submission_create = mocker.Mock(
        survey_id=uuid.uuid4(),
        answers=[]
    )

    survey = mocker.Mock(
        status="public",
        prevent_duplicates=True,
        submission_count=0
    )

    mocker.patch(
        "app.domain.services.submission_service.submission_repository.get_survey_by_id",
        return_value=survey
    )
    mocker.patch(
        "app.domain.services.submission_service.get_questions_by_survey_id",
        return_value=[]
    )
    mocker.patch(
        "app.domain.services.submission_service.validate_answers_creation"
    )
    mocker.patch(
        "app.domain.services.submission_service.submission_repository.check_fingerprint_exists",
        return_value=True
    )

    with pytest.raises(HTTPException) as exc:
        submit_submission(
            session=session,
            submission_create=submission_create,
            fingerprint_data={
                "ip": "127.0.0.1",
                "user_agent": "pytest",
                "survey_id": "123"
            }
        )

    assert exc.value.status_code == 409
