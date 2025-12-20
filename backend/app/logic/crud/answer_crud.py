from ...models.answer import Answer
from sqlmodel import Session

def create_answer(*, session: Session, answer: Answer) -> Answer:
    session.add(answer)
    return answer