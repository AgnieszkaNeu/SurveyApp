from fastapi import APIRouter, Depends
from ...models.user import User
from ...models.survey import SurveyPublic, SurveyCreate
from ...core.db import get_session
from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException
from ...core.db import get_session
from sqlmodel import Session
from fastapi import APIRouter, Depends
from typing import Annotated
from ...core.auth import get_current_user
from ...domain.policies import survey_owner_required
from ...domain.services import survey_service

router = APIRouter (
    prefix = "/survey",
    tags = ["survey"]
)

@router.post("/", response_model=SurveyPublic)
def create_survey(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)], survey_create: SurveyCreate):
    return survey_service.create_survey(session=session, user_id=user.id, survey_create=survey_create)


@router.get("/", response_model = list[SurveyPublic])
def get_all_user_surveys(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)]):
    return survey_service.get_user_surveys(session=session, user_id=user.id)


@router.get("/name/{name}", response_model=list[SurveyPublic])
def get_survey_by_name(*, session: Session = Depends(get_session), user: Annotated[User, Depends(get_current_user)], name: str):
    return survey_service.get_survey_by_name(session=session, name=name, user_id=user.id)


@router.get("/{survey_id}", response_model=SurveyPublic)
def get_survey_by_id(*, session: Session = Depends(get_session), survey = Depends(survey_owner_required)):
    return survey
