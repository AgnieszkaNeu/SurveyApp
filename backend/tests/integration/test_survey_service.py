from app.domain.services.survey_service import create_survey
from app.models.survey import SurveyCreate
from datetime import datetime, timezone, timedelta
from app.domain.services.survey_service import get_user_surveys
from app.models.survey import Survey, StatusEnum
import uuid
import pytest
from app.domain.services.survey_service import get_survey_for_owner
from app.core.exceptions import AccessDeniedError


def test_create_survey_persists_in_db(session):
    user_id = uuid.uuid4()

    survey_create = SurveyCreate(
        name="Integration Test Survey",
        expires_delta=10,
        prevent_duplicates=False
    )

    survey = create_survey(
        session=session,
        user_id=user_id,
        survey_create=survey_create
    )

    assert survey.id is not None
    assert survey.user_id == user_id
    assert survey.name == "Integration Test Survey"

    db_survey = session.get(type(survey), survey.id)
    assert db_survey is not None


def test_survey_is_marked_as_expired(session):
    user_id = uuid.uuid4()

    expired_survey = Survey(
        name="Expired Survey",
        user_id=user_id,
        created_at=datetime.now(timezone.utc) - timedelta(days=2),
        last_updated=datetime.now(timezone.utc) - timedelta(days=2),
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
        status=StatusEnum.public,
        prevent_duplicates=False
    )

    session.add(expired_survey)
    session.commit()

    surveys = get_user_surveys(session=session, user_id=user_id)

    session.refresh(expired_survey)
    assert expired_survey.status == StatusEnum.expired
    assert len(surveys) == 1


def test_get_survey_for_owner_access_denied(session):
    owner_id = uuid.uuid4()
    other_user_id = uuid.uuid4()

    survey = Survey(
        name="Private Survey",
        user_id=owner_id,
        created_at=datetime.now(timezone.utc),
        last_updated=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=10),
        status=StatusEnum.private,
        prevent_duplicates=False
    )

    session.add(survey)
    session.commit()

    with pytest.raises(AccessDeniedError):
        get_survey_for_owner(
            session=session,
            survey_id=survey.id,
            user_id=other_user_id
        )
