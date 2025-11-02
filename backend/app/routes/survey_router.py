from fastapi import APIRouter, Depends
from ..models.user import UserCreate, User, UserPublic
from ..core.db import get_session
from sqlmodel import Session

router = APIRouter (
    prefix = "/survey",
    tags = ["survey"]
)