from sqlmodel import Session
from ..models.survey import StatusEnum
from ..repositories import survey_repository
from ...core.transaction import transactional
@transactional()


def check_and_update_expired_surveys(*, session: Session) -> None:
    expired_surveys = survey_repository.get_expired_surveys(session=session)
    for survey in expired_surveys:
        survey.status = StatusEnum.expired
        session.add(survey)
