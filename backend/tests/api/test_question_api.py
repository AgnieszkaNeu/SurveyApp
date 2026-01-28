def test_create_or_update_questions_for_survey(client, authenticated_user):

    response_survey = client.post(
        "/v1/survey",
        json={
            "name": "HTTP Survey",
            "expires_delta": 10,
            "prevent_duplicates": False
        }
    )
    survey_id = response_survey.json()["id"]

    payload = [
        {
            "content": "Jak się czujesz?",
            "position": 0,
            "answer_type": "open",
            "choices": []
        }
    ]

    response = client.post(
        f"/v1/question/{survey_id}",
        json=payload
    )

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["position"] == 0


def test_get_questions_for_survey(client, authenticated_user):
    
    response_survey = client.post(
        "/v1/survey",
        json={
            "name": "HTTP Survey",
            "expires_delta": 10,
            "prevent_duplicates": False
        }
    )
    survey_id = response_survey.json()["id"]

    client.post(
        f"/v1/question/{survey_id}/",
        json=[
            {
                "content": "Twoje imię?",
                "position": 0,
                "answer_type": "open",
                "choices": []
            }
        ]
    )

    response = client.get(f"/v1/question/{survey_id}/")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["content"] == "Twoje imię?"
