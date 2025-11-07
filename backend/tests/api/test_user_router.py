from fastapi.testclient import TestClient
from ..utils.data import email, make_user_test
from app.routes.user_router import *


def test_get_users(*, test_client: TestClient, insert_data) :
    response = test_client.get("/user")

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data,list)
    assert len(data) == 1
    assert "email" in data[0]
    assert "created_at" in data[0]
    assert "role" in data[0]
    assert "password" not in data[0]
    assert "hashed_password" not in data[0]


def test_create_user(*, test_client: TestClient) :
    response = test_client.post("/user",
                                json={"email": "bob@mail.com", "password": "safe_password"})
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["email"] == "bob@mail.com"
    assert "id" in data
    assert data["hashed_password"] != "safe_password"