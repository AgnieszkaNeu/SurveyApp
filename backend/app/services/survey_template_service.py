import uuid
from sqlmodel import Session, select
from sqlalchemy.exc import NoResultFound
from typing import List, Optional
from app.models.survey_template import SurveyTemplate, SurveyTemplateCreate
from app.core.transaction import transactional
@transactional()


def create_template(
    template_data: SurveyTemplateCreate,
    user_id: Optional[uuid.UUID],
    session: Session
) -> SurveyTemplate:
    template_dict = template_data.model_dump()
    if user_id is not None:
        template_dict['is_public'] = False
    template = SurveyTemplate(
        **template_dict,
        user_id=user_id
    )
    session.add(template)
    session.flush()
    session.refresh(template)
    return template


def get_template_by_id(template_id: uuid.UUID, session: Session) -> SurveyTemplate:
    statement = select(SurveyTemplate).where(SurveyTemplate.id == template_id)
    result = session.exec(statement).first()
    if not result:
        raise NoResultFound(f"Szablon {template_id} nie został znaleziony")
    return result


def get_all_public_templates(session: Session) -> List[SurveyTemplate]:
    statement = select(SurveyTemplate).where(SurveyTemplate.is_public == True).order_by(SurveyTemplate.usage_count.desc())
    return list(session.exec(statement).all())


def get_user_templates(user_id: uuid.UUID, session: Session) -> List[SurveyTemplate]:
    statement = select(SurveyTemplate).where(SurveyTemplate.user_id == user_id).order_by(SurveyTemplate.created_at.desc())
    return list(session.exec(statement).all())


def increment_template_usage(template_id: uuid.UUID, session: Session) -> None:
    statement = select(SurveyTemplate).where(SurveyTemplate.id == template_id)
    template = session.exec(statement).first()
    if not template:
        raise NoResultFound(f"Szablon {template_id} nie został znaleziony")
    template.usage_count += 1
    session.add(template)
    session.commit()
@transactional()


def delete_template(template_id: uuid.UUID, session: Session) -> None:
    template = get_template_by_id(template_id, session)
    session.delete(template)
