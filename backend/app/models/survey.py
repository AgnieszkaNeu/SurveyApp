import uuid

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from .user import User

class SurveyBase(SQLModel):
    name: str = Field(max_length=255)
    is_anonymous: str = Field()
    status: str = Field(default="inactive")


class SurveyCreate(SQLModel):
    pass


class Survey(SurveyBase, table = True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime
    expires_at: datetime
    last_updated: datetime

    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="surveys")  
    