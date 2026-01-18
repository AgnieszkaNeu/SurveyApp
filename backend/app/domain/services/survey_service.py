from sqlmodel import Session
from ...models.survey import Survey, SurveyCreate, StatusEnum
from ..repositories import survey_repository
from ...core.transaction import transactional
from datetime import datetime, timezone, timedelta
from typing import Optional
from ...core.exceptions import AccessDeniedError
import uuid 
@transactional(refresh_returned_instance=True)


def create_survey(*, session: Session, user_id: uuid.UUID, survey_create: SurveyCreate) -> Survey:
    if survey_create.expires_delta:
        expire = datetime.now(timezone.utc) + timedelta(minutes=survey_create.expires_delta)
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=30)
    survey = Survey()
    survey = Survey.model_validate(
        survey_create,
        update= {
            "created_at": datetime.now(timezone.utc),
            "expires_at": expire,
            "last_updated": datetime.now(timezone.utc),
            "user_id": user_id
        }
    )
    new_survey = survey_repository.create_survey(session=session, survey=survey)
    return new_survey
@transactional()


def get_user_surveys(*, session: Session, user_id: uuid.UUID) -> list[Survey]:
    surveys = survey_repository.get_all_user_surveys(session=session, user_id=user_id)
    now = datetime.now(timezone.utc)
    for survey in surveys:
        expires_at = survey.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now and survey.status != StatusEnum.expired:
            survey.status = StatusEnum.expired
            session.add(survey)
    return surveys
@transactional()


def get_survey_by_name(*, session: Session, name: str, user_id: uuid.UUID) -> list[Survey]:
    surveys = survey_repository.get_survey_by_name(session=session, name=name)
    return [survey for survey in surveys if survey.user_id == user_id]
@transactional()


def update_survey_last_updated(*, session: Session, survey_id: uuid.UUID):
    survey = survey_repository.get_survey_by_id(session=session, survey_id=survey_id)
    survey.last_updated =  datetime.now(timezone.utc)
    return survey
@transactional()


def delete_survey(*, session: Session, survey_id: uuid.UUID) -> None:
    survey_repository.delete_survey(session=session, survey_id=survey_id)
@transactional(refresh_returned_instance=True)


def update_survey_status(*, session: Session, survey_id: uuid.UUID, new_status: StatusEnum) -> Survey:
    survey = survey_repository.get_survey_by_id(session=session, survey_id=survey_id)
    survey.status = new_status
    survey.last_updated = datetime.now(timezone.utc)
    session.add(survey)
    return survey
@transactional()


def get_public_surveys(*, session: Session) -> list[Survey]:
    surveys = survey_repository.get_public_surveys(session=session)
    now = datetime.now(timezone.utc)
    for survey in surveys:
        expires_at = survey.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            survey.status = StatusEnum.expired
            session.add(survey)
    return [s for s in surveys if s.status == StatusEnum.public]
@transactional()


def get_public_survey_by_id(*, session: Session, survey_id: uuid.UUID) -> Optional[Survey]:
    survey = survey_repository.get_survey_by_id(session=session, survey_id=survey_id)
    if survey and survey.status == StatusEnum.public:
        return survey
    return None
@transactional()


def get_survey_for_owner(*, session: Session, survey_id: uuid.UUID, user_id: uuid.UUID) -> Survey:
    survey = survey_repository.get_survey_by_id(session=session, survey_id=survey_id)
    if survey.user_id != user_id:
        raise AccessDeniedError(message="Brak wystarczających uprawnień")
    return survey
