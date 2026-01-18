from fastapi import APIRouter, Depends, HTTPException, status, Response
from ...models.user import User
from ...models.survey import SurveyPublic, SurveyCreate, StatusEnum
from ...core.db import get_session
from sqlmodel import Session
from typing import Annotated
from ..authenticate_user import get_current_user
from ...domain.policies import survey_owner_required
from ...domain.services import survey_service
from pydantic import BaseModel
import uuid
router = APIRouter (
    prefix = "/survey",
    tags = ["survey"]
)


class SurveyStatusUpdate(BaseModel):
    status: StatusEnum
@router.post("/", response_model=SurveyPublic)

def create_survey(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)], survey_create: SurveyCreate):
    return survey_service.create_survey(session=session, user_id=user.id, survey_create=survey_create)
@router.get("/", response_model = list[SurveyPublic])

def get_all_user_surveys(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)]):
    return survey_service.get_user_surveys(session=session, user_id=user.id)
@router.get("/public", response_model = list[SurveyPublic])

def get_public_surveys(*, session: Session = Depends(get_session)):
    return survey_service.get_public_surveys(session=session)
@router.get("/name/{name}", response_model=list[SurveyPublic])

def get_survey_by_name(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)], name: str):
    return survey_service.get_survey_by_name(session=session, name=name, user_id=user.id)
@router.get("/{survey_id}", response_model=SurveyPublic)

def get_survey_by_id(*, session: Session = Depends(get_session), survey_id: uuid.UUID, survey = Depends(survey_owner_required)):
    return survey
@router.get("/{survey_id}/public", response_model=SurveyPublic)

def get_public_survey_by_id(*, session: Session = Depends(get_session), survey_id: uuid.UUID):
    survey = survey_service.get_public_survey_by_id(session=session, survey_id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Ankieta nie została znaleziona lub nie jest publiczna")
    return survey
@router.delete("/{survey_id}")

def delete_survey_endpoint(
    *,
    session: Session = Depends(get_session),
    survey_id: uuid.UUID,
    survey = Depends(survey_owner_required)
):
    try:
        survey_service.delete_survey(session=session, survey_id=survey.id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        raise
@router.patch("/{survey_id}/status", response_model=SurveyPublic)

def update_survey_status(
    *,
    session: Session = Depends(get_session),
    survey_id: uuid.UUID,
    status_update: SurveyStatusUpdate,
    survey = Depends(survey_owner_required)
):
    return survey_service.update_survey_status(
        session=session, 
        survey_id=survey.id, 
        new_status=status_update.status
    )
