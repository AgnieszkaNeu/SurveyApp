import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
if TYPE_CHECKING:

    from .answer import AnswerCreate, Answer, AnswerPublic


class SubmissionBase(SQLModel):
    survey_id: uuid.UUID = Field(foreign_key="survey.id")


class SubmissionCreate(SubmissionBase):
    answers: list["AnswerCreate"]
    fingerprint_advanced: Optional[str] = None


class SubmissionPublic(SubmissionBase):
    id: uuid.UUID
    created_at: datetime
    answers: list["AnswerPublic"]


class Submission(SubmissionBase, table = True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    answers: list["Answer"] = Relationship(back_populates="submission")
