import uuid

from sqlmodel import SQLModel, Field, Relationship
from enum import Enum

class answer_type(str, Enum):
    open = "open"
    close = "close"
    multiple = "multiple"
    

class QuestionBase(SQLModel):
    content: str
    position: int
    answer_type: answer_type
    survey_id: uuid.UUID = Field(foreign_key="survey.id")

class QuestionCreate(QuestionBase):
    pass


class Question(QuestionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    choice: list["Choice"] = Relationship(back_populates="question")



class ChoiceBase(SQLModel):
    question_id: uuid.UUID = Field(foreign_key="question.id")
    position: int
    text: str


class ChoiceCreate(ChoiceBase):
    question_position: int


class Choice(ChoiceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    question: Question = Relationship(back_populates="choice")