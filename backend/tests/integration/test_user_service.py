from app.domain.services.user_service import create_user
from app.models.user import UserCreate


def test_create_user_integration(session):
    user_create = UserCreate(
        email="integration@test.com",
        password="secret123"
    )

    user = create_user(session=session, user_create=user_create)

    assert user.id is not None
