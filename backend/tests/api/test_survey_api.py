import uuid

def test_create_survey(client, authenticated_user):
    response = client.post(
        "/v1/survey",
        json={
            "name": "HTTP Survey",
            "expires_delta": 10,
            "prevent_duplicates": False
        }
    )

    assert response.status_code == 200
    assert response.json()["name"] == "HTTP Survey"


def test_get_all_user_surveys(client, authenticated_user):
    client.post(
        "/v1/survey/",
        json={
            "name": "Test survey",
            "prevent_duplicates": False
        }
    )

    response = client.get("/v1/survey/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "Test survey"


def test_get_public_surveys(client, authenticated_user):
    response = client.post(
        "/v1/survey/",
        json={
            "name": "Public survey",
            "prevent_duplicates": False
        }
    )  
    survey_id = response.json()["id"]

    client.patch(
        f"/v1/survey/{survey_id}/status",
        json={"status": "public"}
    )

    response = client.get("/v1/survey/public")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "public"

def test_update_survey_status(client, authenticated_user):
    response = client.post(
        "/v1/survey/",
        json={
            "name": "Status test",
            "prevent_duplicates": False
        }
    )
    survey_id = response.json()["id"]

    response = client.patch(
        f"/v1/survey/{survey_id}/status",
        json={"status": "public"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "public"


def test_get_public_survey_not_found(client):
    response = client.get(f"/v1/survey/{uuid.uuid4()}/public")

    assert response.status_code == 404
