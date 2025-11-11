from app.models.user import User
from app.models.survey import Survey
from datetime import datetime, timezone, timedelta
from app.core.password_utils import hash_password


email = "john.doe@mail.com"
password = "password"
hashed_password = hash_password(password)
created_at=datetime.now(timezone.utc)

def create_user_test() -> User:
        return User(
                email=email,
                hashed_password=hashed_password,
                created_at=created_at
                )


email_superuser = "admin@mail.com"

def create_superuser_test() -> User:
        return User(
                email=email_superuser,
                hashed_password=hashed_password,
                created_at=created_at,
                role="superuser"
                )



survey_name = "Test Survey"
expires_at = created_at + timedelta(days=1)

def create_survey_test(survey_owner) -> Survey:
        return Survey(
                name=survey_name,
                status="active",
                created_at= created_at,
                expires_at= expires_at,
                user = survey_owner
        )