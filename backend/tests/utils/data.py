from app.models.user import User
from app.models.survey import Survey
from datetime import datetime, timezone, timedelta

email = "john.doe@mail.com"
password = "password"
created_at=datetime.now(timezone.utc)

def make_user_test() -> User:
        return User(
                email=email,
                hashed_password=password,
                created_at=created_at
                )

name = "Test Survey"
expires_at = created_at + timedelta(days=1)

def make_survey_test(survey_owner) -> Survey:
        return Survey(
                name=name,
                status="active",
                created_at= created_at,
                expires_at= expires_at,
                user = survey_owner
        )