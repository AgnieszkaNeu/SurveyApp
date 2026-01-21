from collections import defaultdict
import uuid
from ...models.answer import AnswerCreate, Answer
from sqlmodel import Session
from ...core.transaction import transactional   
from ...models.question import Question
from ...core.exceptions import CouldNotCreateResource, SurveyModifiedException
from ..repositories import answer_repository    
from ...models.question import AnswerEnum
@transactional()


def submit_answers(session: Session, answers_create: list[AnswerCreate], submission_id: uuid.UUID) -> list[Answer]:
    answers = [Answer.model_validate(answer_create, update={"submission_id": submission_id}) for answer_create in answers_create]
    answer_repository.submit_answers(session=session, answers=answers)
    return answers


def validate_answers_creation(answers_create: list[AnswerCreate], questions: list[Question]) -> None:
    question_ids = {q.id for q in questions}
    missing_question_ids = []
    for answer in answers_create:
        if answer.question_id not in question_ids:
            missing_question_ids.append(str(answer.question_id))
    if missing_question_ids:
        raise SurveyModifiedException(
            message="Ankieta została zmodyfikowana od momentu jej otwarcia. "
                    "Niektóre pytania zostały usunięte lub zmienione. "
                    "Odśwież stronę aby zobaczyć aktualną wersję."
        )
    answers_by_question = defaultdict(list)
    for a in answers_create:
        answers_by_question[a.question_id].append(a)
    for question in questions:
        answers = answers_by_question.get(question.id, [])
        if question.answer_type == AnswerEnum.open:
            if len(answers) != 1:
                raise CouldNotCreateResource(f"Open question {question.id} must have exactly one answer.")
        elif question.answer_type == AnswerEnum.close:
            if len(answers) != 1:
                raise CouldNotCreateResource(f"Close question {question.id} must have exactly one answer.")
        elif question.answer_type == AnswerEnum.multiple:
            if len(answers) < 1:
                raise CouldNotCreateResource(f"Multiple question {question.id} must have at least one answer.")
        if question.answer_type in {AnswerEnum.close, AnswerEnum.multiple}:
            choices = {choice.content for choice in question.choices}
            for a in answers:
                if a.response not in choices:
                    raise SurveyModifiedException(
                        message="Ankieta została zmodyfikowana od momentu jej otwarcia. "
                                "Opcje odpowiedzi zostały zmienione. "
                                "Odśwież stronę aby zobaczyć aktualną wersję."
                    )
