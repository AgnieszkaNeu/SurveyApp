from sqlmodel import Session
from ...models.share_link import ShareLink, ShareLinkCreate
from ..repositories import share_link_repository
from ...core.transaction import transactional
from datetime import datetime, timezone
from fastapi import HTTPException
import uuid
@transactional(refresh_returned_instance=True)


def create_share_link(*, session: Session, survey_id: uuid.UUID, share_link_create: ShareLinkCreate) -> ShareLink:
    share_link = ShareLink.model_validate(
        share_link_create,
        update={
            "survey_id": survey_id,
            "created_at": datetime.now(timezone.utc)
        }
    )
    new_share_link = share_link_repository.create_share_link(session=session, share_link=share_link)
    return new_share_link
@transactional()


def get_share_links_by_survey(*, session: Session, survey_id: uuid.UUID) -> list[ShareLink]:
    return share_link_repository.get_share_links_by_survey(session=session, survey_id=survey_id)
@transactional()


def get_share_link_by_token(*, session: Session, token: str) -> ShareLink:
    return share_link_repository.get_share_link_by_token(session=session, token=token)
@transactional()


def get_share_link_by_id(*, session: Session, link_id: uuid.UUID) -> ShareLink:
    link = share_link_repository.get_share_link_by_id(session=session, link_id=link_id)
    if not link:
        raise HTTPException(status_code=404, detail="Link nie został znaleziony")
    return link
@transactional()


def delete_share_link(*, session: Session, link_id: uuid.UUID) -> None:
    share_link_repository.delete_share_link(session=session, link_id=link_id)
@transactional()


def increment_clicks(*, session: Session, link_id: uuid.UUID) -> None:
    share_link_repository.increment_clicks(session=session, link_id=link_id)
