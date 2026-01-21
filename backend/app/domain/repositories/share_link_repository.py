from typing import Optional
from sqlmodel import Session, select
from ...models.share_link import ShareLink, ShareLinkCreate
import uuid


def create_share_link(session: Session, share_link: ShareLink) -> ShareLink:
    session.add(share_link)
    return share_link


def get_share_link_by_id(session: Session, link_id: uuid.UUID) -> Optional[ShareLink]:
    return session.exec(select(ShareLink).where(ShareLink.id == link_id)).first()


def get_share_link_by_token(session: Session, token: str) -> Optional[ShareLink]:
    return session.exec(select(ShareLink).where(ShareLink.share_token == token)).first()


def get_share_links_by_survey(session: Session, survey_id: uuid.UUID) -> list[ShareLink]:
    return session.exec(select(ShareLink).where(ShareLink.survey_id == survey_id)).all()


def delete_share_link(session: Session, link_id: uuid.UUID) -> None:
    link = get_share_link_by_id(session=session, link_id=link_id)
    if link:
        session.delete(link)


def increment_clicks(session: Session, link_id: uuid.UUID) -> None:
    link = get_share_link_by_id(session=session, link_id=link_id)
    if link:
        link.clicks += 1
