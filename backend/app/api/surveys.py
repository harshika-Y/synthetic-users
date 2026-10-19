from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Survey, SurveyQuestion, SurveyResponse, Persona, Experiment, User
from app.schemas.schemas import SurveyCreate, SurveyQuestionCreate
from app.api.deps import get_current_user

router = APIRouter(tags=["Surveys"])

@router.post("/experiments/{experiment_id}/surveys")
def create_survey_for_experiment(
    experiment_id: str,
    survey_in: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    survey = Survey(
        experiment_id=exp.id,
        title=survey_in.title,
        description=survey_in.description,
        status="pending"
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)

    for q in survey_in.questions:
        sq = SurveyQuestion(
            survey_id=survey.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=q.options,
            required=q.required,
            order_idx=q.order_idx
        )
        db.add(sq)
    db.commit()
    return {"survey_id": survey.id, "title": survey.title, "questions_count": len(survey_in.questions)}

@router.get("/surveys/{survey_id}/results")
def get_survey_results_matrix(
    survey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    survey = db.query(Survey).filter((Survey.id == survey_id) | (Survey.experiment_id == survey_id)).first()
    if not survey:
        survey = db.query(Survey).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    questions = db.query(SurveyQuestion).filter(SurveyQuestion.survey_id == survey.id).order_by(SurveyQuestion.order_idx).all()
    responses = db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey.id).all()
    
    # Map responses by (persona_id, question_id)
    persona_ids = list(set(r.persona_id for r in responses))
    personas = db.query(Persona).filter(Persona.id.in_(persona_ids)).all() if persona_ids else []
    p_map = {p.id: p for p in personas}

    resp_map = {}
    for r in responses:
        key = f"{r.persona_id}_{r.question_id}"
        resp_map[key] = {
            "response_value": r.response_value,
            "reasoning": r.reasoning,
            "consistency_score": r.consistency_score
        }

    # Build side-by-side comparison matrix
    matrix_rows = []
    for p in personas:
        row = {
            "persona_id": p.id,
            "persona_name": p.name,
            "persona_segment": p.segment,
            "avatar": p.avatar,
            "answers": {}
        }
        for q in questions:
            key = f"{p.id}_{q.id}"
            row["answers"][q.id] = resp_map.get(key, {"response_value": "—", "reasoning": "No response recorded"})
        matrix_rows.append(row)

    # Compute distribution summary per question
    question_stats = []
    for q in questions:
        q_resps = [r for r in responses if r.question_id == q.id]
        val_counts = {}
        for r in q_resps:
            v = r.response_value
            val_counts[v] = val_counts.get(v, 0) + 1
        question_stats.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "distribution": val_counts,
            "total_responses": len(q_resps)
        })

    return {
        "survey_id": survey.id,
        "title": survey.title,
        "questions": [{
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "order_idx": q.order_idx
        } for q in questions],
        "matrix": matrix_rows,
        "statistics": question_stats
    }
