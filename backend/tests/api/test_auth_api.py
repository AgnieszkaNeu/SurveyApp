def test_register_user(client):
    response = client.post(
        "v1/user",
        json={
            "email": "test@example.com",
            "password": "secret123"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"


def test_login_success(client, authenticated_user):
    response = client.post(
        "/v1/auth/token",
        data={
            "username": "test@example.com",
            "password": "secret123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_invalid_credentials(client):
    response = client.post(
        "/v1/auth/token",
        data={
            "username": "nope@example.com",
            "password": "wrong"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 401


def test_protected_endpoint(client,authenticated_user):
    
    client.post(
        "/v1/survey/",
        json={
            "name": "Test survey",
            "prevent_duplicates": False
        }
    )
        
    response = client.get("/v1/survey")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0



