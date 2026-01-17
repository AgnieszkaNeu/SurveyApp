import uuid
import secrets
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import TYPE_CHECKING, Optional
if TYPE_CHECKING:

    from .survey import Survey


def generate_share_token() -> str:
    return secrets.token_urlsafe(16)


class ShareLinkBase(SQLModel):
    is_active: bool = Field(default=True)
    max_responses: Optional[int] = None
    password: Optional[str] = None
    expires_at: Optional[datetime] = None


class ShareLinkCreate(ShareLinkBase):
    pass


class ShareLink(ShareLinkBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    survey_id: uuid.UUID = Field(foreign_key="survey.id")
    share_token: str = Field(default_factory=generate_share_token, unique=True, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    clicks: int = Field(default=0)
    survey: "Survey" = Relationship(back_populates="share_links")


class ShareLinkPublic(ShareLinkBase):
    id: uuid.UUID
    survey_id: uuid.UUID
    share_token: str
    created_at: datetime
    clicks: int
