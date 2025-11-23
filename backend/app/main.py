from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .routes import user_router, login, survey_router, question_router
from .core.db import engine
from . import models
from sqlmodel import SQLModel
from .core.exceptions import BaseException
app = FastAPI(debug=True)

app.include_router(user_router.router)
app.include_router(login.router)
app.include_router(survey_router.router)
app.include_router(question_router.router)

@app.get("/")
def root():
    return {"message": "Hello in Survey APP"}

@app.exception_handler(BaseException)
async def application_error_handler(request: Request, e: BaseException):
    return JSONResponse(status_code=e.status_code, content={"message": e.message})