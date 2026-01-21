import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:

    from .submission import Submission


class AnswerBase(SQLModel):
    question_id: uuid.UUID = Field(foreign_key="question.id", primary_key=True)
    response: str


class AnswerCreate(AnswerBase):
    pass


class AnswerPublic(AnswerBase):
    pass


class Answer(AnswerBase, table = True):
    submission_id: uuid.UUID = Field(foreign_key="submission.id", primary_key=True)
    submission: "Submission" = Relationship(back_populates="answers")
