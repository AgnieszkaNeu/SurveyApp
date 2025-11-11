import uuid

from typing import TYPE_CHECKING
from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from .survey import Survey
from enum import Enum
from sqlalchemy import CheckConstraint


class Role(str, Enum):
    user = "user"
    superuser = "superuser"


class UserBase(SQLModel):
    email: EmailStr = Field(unique = True, index = True, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserPublic(UserBase):
    created_at: datetime


class User(UserBase, table = True):
    __table_args__ = (
        CheckConstraint("role IN ('user','superuser')", name="chk_user_role"),
    )
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime
    is_active: bool = Field(default=True)
    role: Role = Field(default=Role.user)

    surveys: list["Survey"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"}
        )
    

class UserUpdate(SQLModel):
    email: EmailStr | None = None
    password: str | None = None 