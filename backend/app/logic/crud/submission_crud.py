from sqlmodel import Session, select
from ...models.submission import Submission
import uuid

def create_submission(session: Session, submission: Submission) -> Submission:
    session.add(submission)
    return submission

def get_all_survey_submissions(session: Session, survey_id: uuid.UUID) -> list[Submission]:
    statement = select(Submission).where(Submission.survey_id == survey_id)
    results = session.exec(statement)
    return results.all()