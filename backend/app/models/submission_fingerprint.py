import uuid
from sqlmodel import SQLModel, Field
from datetime import datetime


class SubmissionFingerprint(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    survey_id: uuid.UUID = Field(foreign_key="survey.id", index=True)
    fingerprint_hash: str = Field(max_length=64, index=True)
    submitted_at: datetime = Field(default_factory=lambda: datetime.utcnow())
