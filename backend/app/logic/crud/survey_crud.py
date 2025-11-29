from sqlmodel import Session, select
from ...models.survey import Survey
from sqlalchemy.orm import selectinload
import uuid

def get_survey_by_id(session: Session, survey_id: uuid.UUID) -> Survey:
    return session.exec(
        select(Survey)
        .where(Survey.id == survey_id)
        .options(selectinload(Survey.questions))).one()


def create_survey(session: Session, survey: Survey) -> Survey:
    session.add(survey)
    return survey


def get_all_user_surveys(session: Session, user_id: uuid.UUID) -> list[Survey] | None:
    return session.exec(select(Survey).where(Survey.user_id == user_id)).all()


def get_survey_by_name(session: Session, name: str) -> list[Survey] | None:
    return session.exec(select(Survey).where(Survey.name == name)).all()
