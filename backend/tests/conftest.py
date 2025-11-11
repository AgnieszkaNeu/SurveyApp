import pytest
from collections.abc import Generator
from sqlmodel import SQLModel, create_engine, Session
from .utils.data import *
from app.models.user import User
from fastapi.testclient import TestClient
from app.main import app
from app.core.db import get_session
from sqlalchemy.pool import StaticPool

@pytest.fixture(scope="session")
def engine():
    engine = create_engine("sqlite:///:memory:",
                           connect_args={"check_same_thread": False},
                           poolclass=StaticPool
                           )
    return engine


@pytest.fixture()
def prepare_db(engine):
    import app.core.db as core_db
    core_db.engine = engine 
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield 
    SQLModel.metadata.drop_all(engine)



@pytest.fixture()
def session(engine, prepare_db) -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


@pytest.fixture()
def test_client(session: Session):
    def override_get_session():
        yield session
    
    app.dependency_overrides[get_session] = override_get_session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture()
def insert_data(session):
    user = create_user_test()
    superuser = create_superuser_test()
    survey = create_survey_test(user)

    session.add(user)
    session.add(superuser)
    session.add(survey)
    session.commit()
