from sqlmodel import Session
from ...models.response import ResponseCreate, Response
from ...logic.crud import response_crud
from ...core.transaction import transactional

@transactional()
def submit_response(*, session: Session, response_create: ResponseCreate ):
    response = Response.model_validate(
        response_create
    )
    return response_crud.submit_response(session = session, response = response)