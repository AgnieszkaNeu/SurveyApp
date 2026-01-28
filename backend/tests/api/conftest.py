import os
os.environ["ENV"] = "test"
os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool

from app.api.authenticate_user import get_current_user
from app.main import app
from app.core.db import get_session
from app.models import *
from app.api.v1 import survey as survey_api
from app.core.password_hashing import hash_password
from app.models.survey import StatusEnum

import uuid
from datetime import datetime, timezone, timedelta
from app.domain.policies import survey_owner_required



@pytest.fixture(scope="function")
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    def override_get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    
    test_client = TestClient(app)
    test_client.engine = engine 

    yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def authenticated_user(client):

    with Session(client.engine) as session:
            user = User(
                id=uuid.uuid4(),
                email="test@example.com",
                hashed_password=hash_password("secret123"),
                is_active=True,
                created_at=datetime.now(timezone.utc),
                email_confirmed=True,
                role="user"
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            user_id = user.id
        
    def override_get_current_user():
        with Session(client.engine) as session:
            return session.get(User, user_id)

    app.dependency_overrides[get_current_user] = override_get_current_user
    
    yield user
    
    app.dependency_overrides.clear()