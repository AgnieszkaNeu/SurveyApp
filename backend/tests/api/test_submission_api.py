import uuid

def test_check_duplicate_false(client):
    survey_id = uuid.uuid4()

    response = client.post(
        f"/v1/submissions/check-duplicate/{survey_id}",
        json={}
    )

    assert response.status_code == 200
    assert response.json() == {"already_submitted": False}


def test_check_duplicate_with_fingerprint_advanced(client):
    survey_id = uuid.uuid4()

    response = client.post(
        f"/v1/submissions/check-duplicate/{survey_id}",
        json={"fingerprint_advanced": "abc123"}
    )

    assert response.status_code == 200
    assert "already_submitted" in response.json()


def test_submit_submission_success(client, authenticated_user):
    survey_response = client.post(
        "/v1/survey/",
        json={
            "name": "Submission test survey",
            "prevent_duplicates": False
        }
    )
    survey_id = survey_response.json()["id"]

    submission_payload = {
        "survey_id": survey_id,
        "answers": [],
        "fingerprint_advanced": None
    }

    response = client.post(
        "/v1/submissions/",
        json=submission_payload
    )

    assert response.status_code == 200
    
