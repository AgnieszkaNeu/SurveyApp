import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.survey_template import SurveyTemplate, SurveyTemplateCreate, SurveyTemplatePublic
from app.services import survey_template_service
from app.core.db import get_session
from app.domain.policies import get_current_user
from sqlmodel import Session
from sqlalchemy.exc import NoResultFound
router = APIRouter(prefix="/templates", tags=["templates"])
@router.post("/", response_model=SurveyTemplatePublic, status_code=status.HTTP_201_CREATED)


def create_template_endpoint(
    template: SurveyTemplateCreate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    new_template = survey_template_service.create_template(
        template_data=template,
        user_id=current_user.id,
        session=session
    )
    return new_template
@router.get("/public", response_model=List[SurveyTemplatePublic])


def get_public_templates_endpoint(session: Session = Depends(get_session)):
    return survey_template_service.get_all_public_templates(session)
@router.get("/my", response_model=List[SurveyTemplatePublic])


def get_my_templates_endpoint(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    return survey_template_service.get_user_templates(current_user.id, session)
@router.get("/{template_id}", response_model=SurveyTemplatePublic)


def get_template_endpoint(template_id: uuid.UUID, session: Session = Depends(get_session)):
    try:
        template = survey_template_service.get_template_by_id(template_id, session)
        return template
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Szablon nie został znaleziony")
@router.post("/{template_id}/use")


def use_template_endpoint(template_id: uuid.UUID, session: Session = Depends(get_session)):
    try:
        survey_template_service.increment_template_usage(template_id, session)
        return {"message": "Licznik użyć zwiększony"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Szablon nie został znaleziony")
@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)


def delete_template_endpoint(
    template_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    try:
        template = survey_template_service.get_template_by_id(template_id, session)
        if template.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Nie masz uprawnień do usunięcia tego szablonu")
        session.delete(template)
        session.commit()
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Szablon nie został znaleziony")
