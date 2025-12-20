import uuid
from ...models.answer import AnswerCreate, Answer
from sqlmodel import Session
from ...core.transaction import transactional   

@transactional()
def submit_answers(session: Session, answers_create: list[AnswerCreate], submission_id: uuid.UUID) -> list[Answer]:
    answers = [Answer.model_validate(answer_create, update={"submission_id": submission_id}) for answer_create in answers_create]
    session.add_all(answers)
    session.commit()
    for answer in answers:
        session.refresh(answer)
    return answers