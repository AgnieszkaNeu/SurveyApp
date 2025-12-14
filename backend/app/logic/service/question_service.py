from ..crud import question_crud
from sqlmodel import Session
from ...models.question import QuestionCreate, Question
from sqlalchemy.exc import SQLAlchemyError
from ...core.exceptions import CouldNotCreateResource, NotFoundError, BaseException
from ...core.transaction import transactional
import uuid 


def check_order_of_questions(questions: list[QuestionCreate]) -> bool:
    positions_list = tuple((question.position) for question in questions)
    is_ordered = len(questions) == len(positions_list)

    if is_ordered:
        return all(positions_list[i] + 1 == positions_list[i + 1] for i in range(len(positions_list) - 1))
    return False
    

@transactional()
def get_all_survey_questions(session: Session, survey_id: uuid.UUID) -> list[Question]:
    return question_crud.get_all_survey_questions(session=session, survey_id=survey_id)
    
    
@transactional()
def delete_survey_question(session: Session, question_id: uuid.UUID):

    question = question_crud.get_question_by_id(session=session, question_id=question_id)

    if question is None:
        raise NotFoundError(message="Could not find question with given id")

    question_crud.delete_question(session=session, question=question)
    

@transactional()
def delete_exsited(session: Session, survey_id = uuid.UUID): 
    questions = get_all_survey_questions(session=session, survey_id=survey_id)

    for question in questions:
        delete_survey_question(session=session, question_id=question.id)


@transactional(refresh_returned_instance=True)
def create_or_update_questions_for_survey(session: Session, questions: list[QuestionCreate], survey_id = uuid.UUID) -> list[Question]:

    is_ordered = check_order_of_questions(questions = questions)
    if not is_ordered:
        raise CouldNotCreateResource(message="The proper order of questions was not followed")

    created = []
    delete_exsited(session=session, survey_id=survey_id)

    for question_base in questions:
        question = Question.model_validate(question_base, update={"survey_id": survey_id})
        new_question = question_crud.create_question(session=session, question=question)
        created.append(new_question)
    
    return created
