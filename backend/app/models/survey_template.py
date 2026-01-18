import uuid
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime
from typing import Optional, List, Any
from enum import Enum


class TemplateCategoryEnum(str, Enum):
    feedback = "feedback"
    quiz = "quiz"
    poll = "poll"
    research = "research"
    event = "event"
    satisfaction = "satisfaction"
    custom = "custom"


class SurveyTemplateBase(SQLModel):
    name: str = Field(max_length=255)
    description: Optional[str] = None
    category: TemplateCategoryEnum = Field(default=TemplateCategoryEnum.custom)
    questions_data: Any = Field(sa_column=Column(JSON))
    is_public: bool = Field(default=False)


class SurveyTemplateCreate(SurveyTemplateBase):
    pass


class SurveyTemplate(SurveyTemplateBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(foreign_key="user.id", default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    usage_count: int = Field(default=0)


class SurveyTemplatePublic(SurveyTemplateBase):
    id: uuid.UUID
    created_at: datetime
    usage_count: int
