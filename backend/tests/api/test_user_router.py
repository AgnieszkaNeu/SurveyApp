from fastapi.testclient import TestClient
from ..utils.auth import user_authentication_header
from backend.app.api.v1.user import *
from app.models.survey import Survey
from ..utils.data import email, password, email_superuser, survey_name
from sqlmodel import select

def test_get_all_users(*, test_client: TestClient, insert_data) :

    headers = user_authentication_header(client=test_client, email=email_superuser, password=password)
    response = test_client.get("/user/all_users", headers=headers)

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data,list)
    assert len(data) > 0
    assert "email" in data[0]
    assert "created_at" in data[0]
    assert "role" in data[0]
    assert "password" not in data[0]
    assert "hashed_password" not in data[0]


def test_get_all_users_fail(*, test_client: TestClient, insert_data) :

    headers = user_authentication_header(client=test_client, email=email, password=password)
    response = test_client.get("/user/all_users", headers=headers)

    assert response.status_code == 403

    data = response.json()
    assert data["detail"] == "You do not have permission to access this resource"


def test_create_user(*, test_client: TestClient) :
    response = test_client.post("/user",
                                json={"email": "bob@mail.com", "password": "safe_password"})
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["email"] == "bob@mail.com"
    assert "id" in data
    assert data["hashed_password"] != "safe_password"


def test_get_current_user(*, test_client: TestClient, insert_data):
    headers = user_authentication_header(client=test_client, email=email, password=password)
    response = test_client.get("/user/", headers=headers)

    assert response.status_code == 200

    data = response.json()
    assert data["email"] == email


def test_delete_user(*, test_client: TestClient, insert_data, session):
    headers = user_authentication_header(client=test_client, email=email, password=password)
    response = test_client.delete("/user/", headers=headers)

    assert response.status_code == 200

    user_result = session.exec(select(User).where(User.email == email)).all()
    survey_result = session.exec(select(Survey).where(Survey.name == survey_name)).all()

    assert user_result == []
    assert survey_result == []