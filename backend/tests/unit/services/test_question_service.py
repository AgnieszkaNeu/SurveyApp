import uuid
import pytest
from app.core.exceptions import CouldNotCreateResource
from app.domain.services.question_service import is_correct_order, validate_questions_creation
from app.domain.services.question_service import create_or_update_questions_for_survey
from app.domain.services.question_service import delete_survey_question
from app.domain.services.question_service import delete_exsited


class FakeChoice:
    def __init__(self, position):
        self.position = position

class FakeQuestionCreate:
    def __init__(self, position, answer_type, choices=None):
        self.position = position
        self.answer_type = answer_type
        self.choices = choices or []

class FakeSurvey:
    def __init__(self, submission_count=0, is_locked=False, status="private", questions=None):
        self.submission_count = submission_count
        self.is_locked = is_locked
        self.status = status
        self.questions = questions or []
        self.id = uuid.uuid4()


def test_is_correct_order_valid():
    class Obj:
        def __init__(self, position):
            self.position = position

    elements = [Obj(0), Obj(1), Obj(2)]

    assert is_correct_order(elements) is True


def test_is_correct_order_invalid():
    class Obj:
        def __init__(self, position):
            self.position = position

    elements = [Obj(0), Obj(2)]

    assert is_correct_order(elements) is False


def test_validate_questions_creation_survey_has_submissions():
    survey = FakeSurvey(submission_count=1)

    questions = [
        FakeQuestionCreate(0, "open")
    ]

    with pytest.raises(CouldNotCreateResource):
        validate_questions_creation(questions, survey)


def test_validate_questions_creation_invalid_order():
    survey = FakeSurvey()

    questions = [
        FakeQuestionCreate(1, "open"),
        FakeQuestionCreate(0, "open"),
    ]

    with pytest.raises(CouldNotCreateResource):
        validate_questions_creation(questions, survey)


def test_validate_questions_creation_close_without_choices():
    survey = FakeSurvey()

    questions = [
        FakeQuestionCreate(0, "close", choices=[FakeChoice(0)])
    ]

    with pytest.raises(CouldNotCreateResource):
        validate_questions_creation(questions, survey)


def test_validate_questions_creation_success():
    survey = FakeSurvey()

    questions = [
        FakeQuestionCreate(
            0,
            "close",
            choices=[FakeChoice(0), FakeChoice(1)]
        )
    ]

    validate_questions_creation(questions, survey)  


def test_delete_survey_question_success(mocker):
    session = mocker.Mock()
    question_id = uuid.uuid4()
    question = mocker.Mock()

    mocker.patch(
        "app.domain.services.question_service.question_repository.get_question_by_id",
        return_value=question
    )
    delete_mock = mocker.patch(
        "app.domain.services.question_service.question_repository.delete_question"
    )

    delete_survey_question(session=session, question_id=question_id)

    delete_mock.assert_called_once_with(session=session, question=question)


def test_delete_exsited_calls_delete_for_each_question(mocker):
    session = mocker.Mock()
    survey_id = uuid.uuid4()

    q1 = mocker.Mock(id=uuid.uuid4())
    q2 = mocker.Mock(id=uuid.uuid4())

    mocker.patch(
        "app.domain.services.question_service.get_all_survey_questions",
        return_value=[q1, q2]
    )
    delete_mock = mocker.patch(
        "app.domain.services.question_service.delete_survey_question"
    )

    delete_exsited(session=session, survey_id=survey_id)

    assert delete_mock.call_count == 2


def test_create_or_update_questions_for_survey_success(mocker):
    session = mocker.Mock()
    survey = mocker.Mock(id=uuid.uuid4(), submission_count=0, is_locked=False, status="private", questions=[])

    question_create = mocker.Mock(
        position=0,
        answer_type="open",
        choices=[],
        content = "Sample Question",
        model_dump=mocker.Mock(return_value={"position": 0, "answer_type": "open", "content": "Sample Question"})
    )

    mocker.patch("app.domain.services.question_service.validate_questions_creation")
    mocker.patch("app.domain.services.question_service.delete_exsited")
    create_repo = mocker.patch(
        "app.domain.services.question_service.question_repository.create_question",
        return_value=mocker.Mock(id=uuid.uuid4())
    )
    mocker.patch("app.domain.services.question_service.update_survey_last_updated")

    result = create_or_update_questions_for_survey(
        session=session,
        questions=[question_create],
        survey=survey
    )

    assert len(result) == 1
    create_repo.assert_called_once()
