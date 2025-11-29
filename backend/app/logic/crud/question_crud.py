import uuid

from ...models.question import Question, QuestionBase
from sqlmodel import Session, select


def get_question_by_id(session: Session, question_id: uuid.UUID) -> Question | None:
    return session.get(Question, question_id)


def create_question(session: Session, question: QuestionBase) -> Question:
    session.add(question)
    return question


def get_all_survey_questions(session: Session, survey_id: uuid.UUID) -> list[Question] | None:
    return session.exec(select(Question).where(Question.survey_id == survey_id)).all()


def delete_question(session: Session, question: Question):
    session.delete(question)