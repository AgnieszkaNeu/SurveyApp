import uuid
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from enum import Enum
if TYPE_CHECKING:

    from .user import User
    from .question import Question, QuestionPublic
    from .share_link import ShareLink


class StatusEnum(str, Enum):
    public = "public"
    private = "private"
    expired = "expired"


class SurveyBase(SQLModel):
    name: str = Field(max_length=255)
    prevent_duplicates: bool = Field(default=True)


class SurveyCreate(SurveyBase):
    expires_delta: Optional[int] = None
    status: StatusEnum = StatusEnum.private


class Survey(SurveyBase, table = True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime
    expires_at: datetime
    last_updated: datetime
    status: StatusEnum = Field(default=StatusEnum.private)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    submission_count: int = Field(default=0)
    is_locked: bool = Field(default=False)
    locked_at: Optional[datetime] = None
    user: "User" = Relationship(back_populates="surveys") 
    questions: list["Question"] = Relationship(
                                            back_populates="survey",
                                            sa_relationship_kwargs={"cascade": "all, delete"}
                                            )
    share_links: list["ShareLink"] = Relationship(
                                            back_populates="survey",
                                            sa_relationship_kwargs={"cascade": "all, delete"}
                                            )


class SurveyPublic(SurveyBase):
    id: uuid.UUID 
    created_at: datetime
    expires_at: datetime
    last_updated: datetime
    status: StatusEnum
    submission_count: int
    is_locked: bool
    questions: list["QuestionPublic"]
