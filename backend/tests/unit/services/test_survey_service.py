import uuid
from app.domain.services.survey_service import create_survey
from app.domain.services.survey_service import get_user_surveys
from app.models.survey import StatusEnum
from datetime import datetime, timezone, timedelta
from app.domain.services.survey_service import get_survey_by_name
from app.domain.services.survey_service import update_survey_last_updated
from app.domain.services.survey_service import update_survey_status
from app.domain.services.survey_service import get_public_surveys
from app.domain.services.survey_service import get_public_survey_by_id
from app.domain.services.survey_service import get_survey_for_owner
import pytest
from app.models.survey import SurveyCreate


def test_create_survey_with_expires_delta(mocker):
    session = mocker.Mock()
    user_id = uuid.uuid4()

    survey_create = SurveyCreate(
        name="Test survey",
        expires_delta=10,
        prevent_duplicates=False
    )

    created_survey = mocker.Mock()
    repo_mock = mocker.patch(
        "app.domain.services.survey_service.survey_repository.create_survey",
        return_value=created_survey
    )

    result = create_survey(
        session=session,
        user_id=user_id,
        survey_create=survey_create
    )

    repo_mock.assert_called_once()
    assert result == created_survey



def test_get_user_surveys_marks_expired(mocker):
    session = mocker.Mock()
    user_id = uuid.uuid4()

    expired = mocker.Mock(
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
        status=StatusEnum.public
    )
    active = mocker.Mock(
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        status=StatusEnum.public
    )

    mocker.patch(
        "app.domain.services.survey_service.survey_repository.get_all_user_surveys",
        return_value=[expired, active]
    )

    result = get_user_surveys(session=session, user_id=user_id)

    assert expired.status == StatusEnum.expired
    session.add.assert_called_once_with(expired)
    assert active.status == StatusEnum.public
    assert len(result) == 2

def test_get_survey_by_name_filters_by_owner(mocker):
    session = mocker.Mock()
    user_id = uuid.uuid4()

    owned = mocker.Mock(user_id=user_id)
    foreign = mocker.Mock(user_id=uuid.uuid4())

    mocker.patch(
        "app.domain.services.survey_service.survey_repository.get_survey_by_name",
        return_value=[owned, foreign]
    )

    result = get_survey_by_name(session=session, name="test", user_id=user_id)

    assert result == [owned]


def test_update_survey_last_updated(mocker):
    session = mocker.Mock()
    survey = mocker.Mock()

    mocker.patch(
        "app.domain.services.survey_service.survey_repository.get_survey_by_id",
        return_value=survey
    )

    result = update_survey_last_updated(
        session=session,
        survey_id=uuid.uuid4()
    )

    assert survey.last_updated is not None
    assert result == survey


def test_update_survey_status(mocker):
    session = mocker.Mock()
    survey = mocker.Mock()

    mocker.patch(
        "app.domain.services.survey_service.survey_repository.get_survey_by_id",
        return_value=survey
    )

    result = update_survey_status(
        session=session,
        survey_id=uuid.uuid4(),
        new_status=StatusEnum.public
    )

    assert survey.status == StatusEnum.public
    session.add.assert_called_once_with(survey)
    assert result == survey


def test_get_public_surveys_filters_and_expires(mocker):
    session = mocker.Mock()

    expired = mocker.Mock(
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
        status=StatusEnum.public
    )
    active = mocker.Mock(
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        status=StatusEnum.public
    )

    mocker.patch(
        "app.domain.services.survey_service.survey_repository.get_public_surveys",
        return_value=[expired, active]
    )

    result = get_public_surveys(session=session)

    assert expired.status == StatusEnum.expired
    assert result == [active]


def test_get_public_survey_by_id_returns_only_public(mocker):
    session = mocker.Mock()
    public = mocker.Mock(status=StatusEnum.public)
    private = mocker.Mock(status=StatusEnum.private)

    repo = mocker.patch(
        "app.domain.services.survey_service.survey_repository.get_survey_by_id"
    )

    repo.return_value = public
    assert get_public_survey_by_id(session=session, survey_id=uuid.uuid4()) == public

    repo.return_value = private
    assert get_public_survey_by_id(session=session, survey_id=uuid.uuid4()) is None


from app.core.exceptions import AccessDeniedError

def test_get_survey_for_owner_access_denied(mocker):
    session = mocker.Mock()
    survey = mocker.Mock(user_id=uuid.uuid4())

    mocker.patch(
        "app.domain.services.survey_service.survey_repository.get_survey_by_id",
        return_value=survey
    )

    with pytest.raises(AccessDeniedError):
        get_survey_for_owner(
            session=session,
            survey_id=uuid.uuid4(),
            user_id=uuid.uuid4()
        )
