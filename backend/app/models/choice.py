import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:

    from .question import Question


class ChoiceBase(SQLModel):
    position: int
    content: str


class ChoiceCreate(ChoiceBase):
    pass


class ChoicePublic(ChoiceBase):
    pass


class Choice(ChoiceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    question_id: uuid.UUID = Field(foreign_key="question.id")
    question: "Question" = Relationship(back_populates="choices")
