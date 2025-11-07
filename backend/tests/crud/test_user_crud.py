import uuid

from ..utils.utils import random_email, random_string
from ..utils.data import email
from app.logic.user_crud import *
from app.models.user import User, UserCreate
from app.core.password_utils import verify_password


def test_create_user(session):
    email_rand = random_email()
    password_rand = random_string()
    userCreate = UserCreate(email=email_rand, password = password_rand)

    user = create_user(session, userCreate)

    assert user.email==email_rand
    assert verify_password(password_rand, user.hashed_password)
    assert user.role=="user"
    assert hasattr(user,"id")
    assert hasattr(user,"created_at")
    assert isinstance(user.id, uuid.UUID)
    assert user.is_active


def test_get_user_email(session, insert_data):
    user = get_user_by_email(session, email)
    
    assert isinstance(user, User)
    assert user.email==email


def test_get_user_by_email_return_none(session):
    user = get_user_by_email(session, random_email())

    assert user == None


def test_get_users(session, insert_data):
    users = get_users(session)

    assert isinstance(users, list)
    assert users[0].email == email
    assert len(users) == 1


def test_delete_user(session):
    email_rand = random_email()
    password_rand = random_string()
    userCreate = UserCreate(email=email_rand, password = password_rand)
    create_user(session, userCreate)

    user = session.exec(select(User).where(User.email == email_rand)).one()
    delete_user(session, user)

    result = session.exec(select(User).where(User.email == email_rand)).all()

    assert result == []

