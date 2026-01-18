import uuid
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON
from enum import Enum
from typing import TYPE_CHECKING, List, Optional, Dict, Any
if TYPE_CHECKING:

    from .survey import Survey
    from .choice import Choice, ChoiceCreate, ChoicePublic 


class AnswerEnum(str, Enum):
    open = "open"
    close = "close"
    multiple = "multiple"
    scale = "scale"
    rating = "rating"
    yes_no = "yes_no"
    dropdown = "dropdown"
    date = "date"
    email = "email"
    number = "number"


class QuestionBase(SQLModel):
    content: str
    position: int
    answer_type: AnswerEnum
    settings: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))


class QuestionCreate(QuestionBase):
    choices: Optional[List["ChoiceCreate"]] = None


class QuestionPublic(QuestionBase):
    choices: list["ChoicePublic"]
    id: uuid.UUID


class Question(QuestionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    survey_id: uuid.UUID = Field(foreign_key="survey.id")
    choices: List["Choice"] = Relationship(back_populates="question",
                                           sa_relationship_kwargs={"cascade": "all, delete"})
    survey: "Survey" = Relationship(back_populates="questions")
