from fastapi import APIRouter, Depends, HTTPException, status
from ...models.user import User
from ...models.share_link import ShareLinkPublic, ShareLinkCreate
from ...models.survey import SurveyPublic
from ...core.db import get_session
from sqlmodel import Session
from typing import Annotated
from ..authenticate_user import get_current_user
from ...domain.policies import survey_owner_required
from ...domain.services import share_link_service
from ...domain.repositories import survey_repository
import uuid
router = APIRouter(
    prefix="/share",
    tags=["share"]
)
@router.post("/{survey_id}", response_model=ShareLinkPublic, status_code=status.HTTP_201_CREATED)


def create_share_link(
    *,
    session: Session = Depends(get_session),
    user: Annotated[User, Depends(get_current_user)],
    survey = Depends(survey_owner_required),
    share_link_create: ShareLinkCreate
):
    return share_link_service.create_share_link(
        session=session,
        survey_id=survey.id,
        share_link_create=share_link_create
    )
@router.get("/survey/{survey_id}", response_model=list[ShareLinkPublic])


def get_share_links_for_survey(
    *,
    session: Session = Depends(get_session),
    survey = Depends(survey_owner_required)
):
    return share_link_service.get_share_links_by_survey(
        session=session,
        survey_id=survey.id
    )
@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)


def delete_share_link(
    *,
    session: Session = Depends(get_session),
    user: Annotated[User, Depends(get_current_user)],
    link_id: uuid.UUID
):
    link = share_link_service.get_share_link_by_id(session=session, link_id=link_id)
    survey = survey_repository.get_survey_by_id(session=session, survey_id=link.survey_id)
    if survey.user_id != user.id:
        raise HTTPException(
            status_code=403, 
            detail="Nie masz uprawnień do usunięcia tego linku"
        )
    share_link_service.delete_share_link(session=session, link_id=link_id)
    return None
@router.get("/token/{token}/survey", response_model=SurveyPublic)


def get_survey_by_share_token(
    *,
    session: Session = Depends(get_session),
    token: str
):
    share_link = share_link_service.get_share_link_by_token(session=session, token=token)
    if not share_link or not share_link.is_active:
        raise HTTPException(status_code=404, detail="Link nie został znaleziony lub wygasł")
    share_link_service.increment_clicks(session=session, link_id=share_link.id)
    survey = survey_repository.get_survey_by_id(session=session, survey_id=share_link.survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Ankieta nie została znaleziona")
    return survey
