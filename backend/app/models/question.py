import uuid
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .survey import Survey
    from .choice import Choice, ChoiceCreate, ChoicePublic 


class AnswerEnum(str, Enum):
    open = "open"
    close = "close"
    multiple = "multiple"
    

class QuestionBase(SQLModel):
    content: str
    position: int
    answer_type: AnswerEnum


class QuestionCreate(QuestionBase):
    choices: list["ChoiceCreate"] | None = None


class QuestionPublic(QuestionBase):
    choices: list["ChoicePublic"]


class Question(QuestionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    survey_id: uuid.UUID = Field(foreign_key="survey.id")

    choices: List["Choice"] = Relationship(back_populates="question",
                                           sa_relationship_kwargs={"cascade": "all, delete"})
    survey: "Survey" = Relationship(back_populates="questions")