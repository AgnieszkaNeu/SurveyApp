import uuid

from sqlmodel import Session
from ..utils.utils import random_email, random_lower_string, random_string
from app.logic.user_crud import *
from app.models.survey import Survey
from app.models.user import User, UserCreate

def test_create_user(session):
    email = random_email()
    password = random_string()
    userCreate = UserCreate(email=email, password=password)
    user = create_user(session, userCreate)

    assert user.email==email
    assert hasattr(user,"id")
    assert isinstance(user.id, uuid.UUID)

