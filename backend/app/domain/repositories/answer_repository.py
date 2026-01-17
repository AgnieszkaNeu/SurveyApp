from ...models.answer import Answer
from sqlmodel import Session


def submit_answers(*, session: Session, answers: list[Answer]) -> list[Answer]:
    session.add_all(answers)
    return answers
