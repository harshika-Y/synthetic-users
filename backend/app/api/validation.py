from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import ValidationRun, Persona, Experiment, Survey, SurveyQuestion, SurveyResponse, User
from app.schemas.schemas import ValidationRunOut
from app.services.validation_engine import validation_engine
from app.api.deps import get_current_user

router = APIRouter(tags=["Validation"])

@router.get("/experiments/{experiment_id}/validation", response_model=Optional[ValidationRunOut])
def get_experiment_validation(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(ValidationRun).filter(ValidationRun.experiment_id == experiment_id).order_by(ValidationRun.created_at.desc()).first()
    if not run:
        return None
    return run

@router.post("/experiments/{experiment_id}/validate", response_model=ValidationRunOut)
def run_validation(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    personas = db.query(Persona).all()
    persona_dicts = [{
        "id": p.id,
        "name": p.name,
        "segment": p.segment,
        "consistency_profile": p.consistency_profile or {}
    } for p in personas]

    survey = db.query(Survey).filter(Survey.experiment_id == exp.id).first()
    questions = db.query(SurveyQuestion).filter(SurveyQuestion.survey_id == survey.id).all() if survey else []
    q_dicts = [{"id": q.id, "question_text": q.question_text} for q in questions]

    responses = db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey.id).all() if survey else []
    resp_dicts = [{
        "persona_id": r.persona_id,
        "question_id": r.question_id,
        "response_value": r.response_value,
        "reasoning": r.reasoning
    } for r in responses]

    val_res = validation_engine.evaluate_experiment(persona_dicts, q_dicts, resp_dicts)

    db.query(ValidationRun).filter(ValidationRun.experiment_id == exp.id).delete()
    db.commit()

    v_run = ValidationRun(
        experiment_id=exp.id,
        overall_score=val_res["overall_score"],
        profile_alignment_score=val_res["profile_alignment_score"],
        relevance_score=val_res["relevance_score"],
        contradiction_count=val_res["contradiction_count"],
        warnings=val_res["warnings"],
        details=val_res["details"]
    )
    db.add(v_run)
    db.commit()
    db.refresh(v_run)
    return v_run
