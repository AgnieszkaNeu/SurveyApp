import uuid

from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .answer import AnswerCreate, Answer, AnswerPublic


class SubmissionBase(SQLModel):
    survey_id: uuid.UUID = Field(foreign_key="survey.id")


class SubmissionCreate(SubmissionBase):
    answers: list["AnswerCreate"]


class SubmissionPublic(SubmissionBase):
    answers: list["AnswerPublic"]
    

class Submission(SubmissionBase, table = True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    answers: list["Answer"] = Relationship(back_populates="submission")