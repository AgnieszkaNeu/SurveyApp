from .api.v1 import auth, question, submission, user, share_link, survey_template, gdpr
from .core.config import settings
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import survey
from .core.db import engine
from . import models
from sqlmodel import SQLModel
from .core.exceptions import ApplicationException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENV != "test":
        SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(
    title="Ankietio API",
    description="API dla aplikacji Ankietio - system do tworzenia i wypełniania anonimowych ankiet online",
    version="1.0.0",
    debug=True,
    lifespan=lifespan
)

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    path = request.url.path
    if "/auth/token" in path:
        message = "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę."
    elif "/user/" in path and request.method == "POST":
        message = "Zbyt wiele prób rejestracji. Spróbuj ponownie za godzinę."
    elif "/submissions" in path:
        message = "Zbyt wiele przesłanych ankiet. Spróbuj ponownie za chwilę."
    elif "/password" in path:
        message = "Zbyt wiele prób resetowania hasła. Spróbuj ponownie za godzinę."
    elif "/email" in path:
        message = "Zbyt wiele prób weryfikacji email. Spróbuj ponownie za godzinę."
    else:
        message = "Zbyt wiele żądań. Spróbuj ponownie za chwilę."
    return JSONResponse(
        status_code=429,
        content={"detail": message}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user.router, prefix="/v1")
app.include_router(auth.router, prefix="/v1")
app.include_router(survey.router, prefix="/v1")
app.include_router(question.router, prefix="/v1")
app.include_router(submission.router, prefix="/v1")
app.include_router(share_link.router, prefix="/v1")
app.include_router(survey_template.router, prefix="/v1")
app.include_router(gdpr.router, prefix="/v1")
@app.get("/")


def root():
    return {"message": "Witamy w Ankietio API"}

@app.exception_handler(ApplicationException)
async def application_error_handler(request: Request, e: ApplicationException):
    return JSONResponse(status_code=e.status_code, content={"message": e.message})
