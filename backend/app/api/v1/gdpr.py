from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, delete
from ...core.db import get_session
from ...models.user import User
from ...models.survey import Survey
from ...models.submission import Submission
from ...models.submission_fingerprint import SubmissionFingerprint
from ..authenticate_user import get_current_user
from typing import Any, Annotated
import json
router = APIRouter(
    prefix="/gdpr",
    tags=["GDPR"]
)
@router.get("/my-data")


def get_my_data(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_user)]
) -> dict[str, Any]:
    surveys = session.exec(
        select(Survey).where(Survey.user_id == current_user.id)
    ).all()
    submissions = session.exec(
        select(Submission)
        .join(Survey)
        .where(Survey.user_id == current_user.id)
    ).all()
    fingerprints = session.exec(
        select(SubmissionFingerprint)
        .where(SubmissionFingerprint.survey_id.in_([s.id for s in surveys]))
    ).all() if surveys else []
    user_data = {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "email_confirmed": current_user.email_confirmed
        },
        "surveys": [
            {
                "id": str(survey.id),
                "title": survey.title,
                "status": survey.status,
                "created_at": survey.created_at.isoformat() if survey.created_at else None,
                "submission_count": survey.submission_count
            }
            for survey in surveys
        ],
        "submissions_count": len(submissions),
        "fingerprints_count": len(fingerprints),
        "export_date": None
    }
    return user_data
@router.delete("/my-data")


def delete_my_data(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_user)]
) -> dict[str, str]:
    try:
        surveys = session.exec(
            select(Survey).where(Survey.user_id == current_user.id)
        ).all()
        survey_ids = [survey.id for survey in surveys]
        if survey_ids:
            session.exec(
                delete(SubmissionFingerprint).where(
                    SubmissionFingerprint.survey_id.in_(survey_ids)
                )
            )
        if survey_ids:
            session.exec(
                delete(Submission).where(Submission.survey_id.in_(survey_ids))
            )
        for survey in surveys:
            session.delete(survey)
        session.delete(current_user)
        session.commit()
        return {
            "message": "Wszystkie dane zostały usunięte",
            "deleted_surveys": len(surveys),
            "user_id": str(current_user.id)
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas usuwania danych: {str(e)}"
        )
@router.get("/export-data")


def export_my_data(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_user)]
) -> dict[str, Any]:

    from datetime import datetime
    data = get_my_data(session=session, current_user=current_user)
    data["export_date"] = datetime.utcnow().isoformat()
    data["export_format"] = "JSON"
    data["gdpr_article"] = "Art. 20 - Prawo do przenoszenia danych"
    return data
@router.get("/consent-status")


def get_consent_status(
    *,
    current_user: Annotated[User, Depends(get_current_user)]
) -> dict[str, Any]:
    return {
        "message": "Zgody są przechowywane lokalnie w przeglądarce (localStorage)",
        "user_id": str(current_user.id),
        "instructions": "Sprawdź ustawienia w panelu 'Ustawienia Prywatności' w aplikacji"
    }
