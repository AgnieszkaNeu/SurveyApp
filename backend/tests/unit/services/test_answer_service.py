import pytest
import uuid
from app.domain.services.answer_service import validate_answers_creation
from app.core.exceptions import SurveyModifiedException
from app.models.answer import AnswerCreate
from app.models.question import Question, AnswerEnum
from app.core.exceptions import CouldNotCreateResource
from app.domain.services.answer_service import submit_answers

class FakeChoice:
    def __init__(self, content: str):
        self.content = content


class FakeQuestion:
    def __init__(self, id, answer_type, choices):
        self.id = id
        self.answer_type = answer_type
        self.choices = choices



def test_validate_answers_missing_question():
    answers = [
        AnswerCreate(question_id=uuid.uuid4(), response="Tak")
    ]

    questions = []

    with pytest.raises(SurveyModifiedException):
        validate_answers_creation(answers, questions)


def test_open_question_requires_exactly_one_answer():
    q_id = uuid.uuid4()

    question = Question(
        id=q_id,
        answer_type=AnswerEnum.open,
        choices=[]
    )
    answers = []  

    with pytest.raises(Exception):
        validate_answers_creation(answers, [question])



def test_multiple_question_requires_at_least_one_answer():
    q_id = uuid.uuid4()

    question = FakeQuestion(
            id=q_id,
            answer_type=AnswerEnum.multiple,
            choices=[FakeChoice("A")]
        )
    answers = []

    with pytest.raises(CouldNotCreateResource):
        validate_answers_creation(answers, [question])


def test_invalid_choice_raises_survey_modified():
    q_id = uuid.uuid4()

    question = FakeQuestion(
        id=q_id,
        answer_type=AnswerEnum.close,
        choices=[FakeChoice("A")]
    )
    answers = [
        AnswerCreate(question_id=q_id, response="B") 
    ]

    with pytest.raises(SurveyModifiedException):
        validate_answers_creation(answers, [question])


def test_validate_answers_success():
    q_id = uuid.uuid4()

    question = FakeQuestion(
        id=q_id,
        answer_type=AnswerEnum.close,
        choices=[FakeChoice("Tak")]
    )
    answers = [
        AnswerCreate(question_id=q_id, response="Tak")
    ]

    validate_answers_creation(answers, [question])


def test_submit_answers_calls_repository(mocker):

    session = mocker.Mock()
    submission_id = uuid.uuid4()

    answers_create = [
        AnswerCreate(question_id=uuid.uuid4(), response="Tak")
    ]

    submit_mock = mocker.patch(
        "app.domain.services.answer_service.answer_repository.submit_answers"
    )

    result = submit_answers(session = session, answers_create = answers_create, submission_id = submission_id)

    submit_mock.assert_called_once()
    assert len(result) == 1
    assert result[0].submission_id == submission_id
