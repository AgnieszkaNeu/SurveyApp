from sqlmodel import Session
from ...models.submission import SubmissionCreate, Submission
from .answer_service import submit_answers
from ...core.transaction import transactional
from ..crud import submission_crud
from ..service.question_service import get_questions_by_survey_id
from ...logic.service.answer_service import validate_answers_creation
import uuid
    
@transactional()
def submit_submission(*, session: Session, submission_create: SubmissionCreate):

    questions = get_questions_by_survey_id(session = session, survey_id = submission_create.survey_id)
    validate_answers_creation(
        answers_create = submission_create.answers,
        questions = questions
    )
    
    submission = Submission.model_validate(
        submission_create.model_dump(exclude={"answers"})
    )
    created_submission = submission_crud.create_submission(session = session, submission = submission)
    
    answers = submission_create.answers
    submit_answers(
        session = session,
        answers_create = answers,
        submission_id = created_submission.id
    )


@transactional()
def get_all_survey_submissions(*, session: Session, survey_id: uuid.UUID):
    return submission_crud.get_all_survey_submissions(session=session, survey_id=survey_id)