import uuid
from typing import Optional, List
from ...models.question import Question, QuestionBase
from sqlmodel import Session, select


def get_question_by_id(session: Session, question_id: uuid.UUID) -> Optional[Question]:
    return session.get(Question, question_id)


def create_question(session: Session, question: QuestionBase) -> Question:
    session.add(question)
    return question


def get_questions_by_survey_id(session: Session, survey_id: uuid.UUID) -> Optional[List[Question]]:
    return session.exec(select(Question).where(Question.survey_id == survey_id)).all()


def delete_question(session: Session, question: Question):
    session.delete(question)
