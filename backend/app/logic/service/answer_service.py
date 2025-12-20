import uuid
from ...models.answer import AnswerCreate, Answer
from sqlmodel import Session
from ...core.transaction import transactional   
from ...models.question import Question
from ...core.exceptions import CouldNotCreateResource

@transactional()
def submit_answers(session: Session, answers_create: list[AnswerCreate], submission_id: uuid.UUID) -> list[Answer]:
    answers = [Answer.model_validate(answer_create, update={"submission_id": submission_id}) for answer_create in answers_create]
    session.add_all(answers)
    session.commit()
    for answer in answers:
        session.refresh(answer)
    return answers


def validate_answers_creation(answers_create: list[AnswerCreate], questions: list[Question]) -> None:
    
    for question in questions:
        answer = [a for a in answers_create if a.question_id == question.id]

        if question.answer_type == "open" or question.answer_type == "close":
            if len(answer) != 1:
                raise CouldNotCreateResource(f"Open question {question.id} must have exactly one answer.")
        
        if question.answer_type == "multiple":
            if len(answer) < 1:
                raise CouldNotCreateResource(f"Multiple choice question {question.id} must have at least one answer.")
            
            choices = [choice.content for choice in question.choices]
            for a in answer:
                if a.response not in choices:
                    raise CouldNotCreateResource(f"Answer to multiple choice question {question.id} must be one of the predefined choices.")