import uuid
from ...models.choice import Choice
from sqlmodel import Session


def create_choice(session: Session, choice: Choice) -> Choice:
    session.add(choice)
    return choice
