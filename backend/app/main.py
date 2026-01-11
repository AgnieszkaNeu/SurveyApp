from .api.v1 import auth, question, submission, user
from .core.config import settings
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .api.v1 import survey
from .core.db import engine
from . import models
from sqlmodel import SQLModel
from .core.exceptions import BaseException
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings

app = FastAPI(debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(survey.router)
app.include_router(question.router)
app.include_router(submission.router)

@app.get("/")
def root():
    return {"message": "Hello in Survey APP"}

@app.exception_handler(BaseException)
async def application_error_handler(request: Request, e: BaseException):
    return JSONResponse(status_code=e.status_code, content={"message": e.message})