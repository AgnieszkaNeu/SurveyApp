from typing import Optional, List
from sqlmodel import Session, select
from ...models.survey import Survey
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import NoResultFound
from ...core.exceptions import NotFoundError
import uuid


def get_survey_by_id(session: Session, survey_id: uuid.UUID) -> Survey:
    try:
        return session.exec(
            select(Survey)
            .where(Survey.id == survey_id)
            .options(selectinload(Survey.questions))).one()
    except NoResultFound:
        raise NotFoundError(f"Ankieta o id {survey_id} nie została znaleziona")


def create_survey(session: Session, survey: Survey) -> Survey:
    session.add(survey)
    return survey


def get_all_user_surveys(session: Session, user_id: uuid.UUID) -> Optional[List[Survey]]:
    return session.exec(select(Survey).where(Survey.user_id == user_id)).all()


def get_survey_by_name(session: Session, name: str) -> Optional[List[Survey]]:
    return session.exec(select(Survey).where(Survey.name == name)).all()


def delete_survey(session: Session, survey_id: uuid.UUID) -> None:
    survey = get_survey_by_id(session=session, survey_id=survey_id)
    session.delete(survey)


def get_public_surveys(session: Session) -> List[Survey]:

    from ...models.survey import StatusEnum
    return session.exec(
        select(Survey).where(Survey.status == StatusEnum.public)
    ).all()


def get_survey_by_id_simple(session: Session, survey_id: uuid.UUID) -> Optional[Survey]:
    return session.exec(
        select(Survey).where(Survey.id == survey_id)
    ).first()


def get_expired_surveys(session: Session) -> List[Survey]:

    from ...models.survey import StatusEnum
    from datetime import datetime, timezone
    return session.exec(
        select(Survey).where(
            Survey.status != StatusEnum.expired,
            Survey.expires_at < datetime.now(timezone.utc)
        )
    ).all()
