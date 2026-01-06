from ...core.transaction import transactional
from ...models.choice import Choice, ChoiceCreate
from ..repositories import choice_repository
from sqlmodel import Session

import uuid

@transactional()
def create_choices(session: Session, choices_create: list[ChoiceCreate], question_id: uuid.UUID):
    choices = []
    for choice_create in choices_create:
        choice = Choice.model_validate(choice_create, update = { "question_id" : question_id })
        choices.append(choice_repository.create_choice(session = session, choice = choice))

    return choices