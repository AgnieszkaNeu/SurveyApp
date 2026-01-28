from app.domain.services.share_link_service import create_share_link
from app.models.share_link import ShareLinkCreate
import uuid


def test_create_share_link_integration(session):
    survey_id = uuid.uuid4()

    share_link_create = ShareLinkCreate(
        token="abc123"
    )

    link = create_share_link(
        session=session,
        survey_id=survey_id,
        share_link_create=share_link_create
    )

    assert link.id is not None
    assert link.survey_id == survey_id
    assert link.created_at is not None
