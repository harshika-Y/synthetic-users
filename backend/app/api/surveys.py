from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import (
    Survey, SurveyQuestion, SurveyResponse, Persona, Experiment,
    Product, Workspace, AdoptionScore, User
)
from app.schemas.schemas import SurveyCreate, SurveyQuestionCreate, SurveyRunCustomRequest
from app.services.survey_engine import survey_engine
from app.services.adoption_scorer import adoption_scorer
from app.api.deps import get_current_user

router = APIRouter(tags=["Surveys"])

@router.post("/surveys/run-custom")
async def run_custom_survey(
    req: SurveyRunCustomRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes a targeted survey with user-specified questions against:
    - a single person (persona_scope='single', persona_ids=[id])
    - selected persons (persona_scope='selected', persona_ids=[id1, id2, ...])
    - all persons (persona_scope='all')
    """
    if not req.questions:
        raise HTTPException(status_code=400, detail="Please provide at least one survey question.")

    # 1. Resolve Target Personas
    scope = (req.persona_scope or "all").lower().strip()
    if scope == "single":
        if not req.persona_ids:
            p = db.query(Persona).first()
        else:
            p = db.query(Persona).filter(Persona.id == req.persona_ids[0]).first()
        if not p:
            raise HTTPException(status_code=404, detail="Selected persona not found.")
        target_personas = [p]

    elif scope == "selected":
        if not req.persona_ids:
            raise HTTPException(status_code=400, detail="Please select at least one persona.")
        target_personas = db.query(Persona).filter(Persona.id.in_(req.persona_ids)).all()
        if not target_personas:
            raise HTTPException(status_code=404, detail="No matching personas found for selection.")

    else: # "all"
        target_personas = db.query(Persona).all()
        if not target_personas:
            raise HTTPException(status_code=404, detail="No personas available in system.")

    # 2. Resolve Experiment & Product
    exp = None
    if req.experiment_id:
        exp = db.query(Experiment).filter(Experiment.id == req.experiment_id).first()
    if not exp:
        exp = db.query(Experiment).order_by(Experiment.created_at.desc()).first()

    product = None
    if req.product_id:
        product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product and exp:
        product = exp.product
    if not product:
        product = db.query(Product).first()

    # If no experiment exists, create one
    if not exp:
        ws = db.query(Workspace).filter(Workspace.owner_id == current_user.id).first()
        if not ws:
            ws = Workspace(name="Default Research Lab", owner_id=current_user.id)
            db.add(ws)
            db.commit()
            db.refresh(ws)
        exp = Experiment(
            workspace_id=ws.id,
            product_id=product.id if product else "",
            title=req.title or "Custom Targeted Persona Survey",
            objective="Evaluate custom research questions across selected synthetic personas",
            primary_question=req.questions[0].get("question_text", "Hypothesis validation"),
            method="survey",
            status="completed",
            selected_persona_ids=[p.id for p in target_personas],
            questions_config=req.questions
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)

    # 3. Create or Update Survey
    survey = db.query(Survey).filter(Survey.experiment_id == exp.id).first()
    if not survey:
        survey = Survey(
            experiment_id=exp.id,
            title=req.title or f"Survey: {exp.title}",
            description=f"Survey on {product.name if product else 'Product'} ({scope} cohort)",
            status="running"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)
    else:
        survey.title = req.title or survey.title
        survey.status = "running"
        db.commit()

    # 4. Clean old questions & responses for this survey
    db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey.id).delete()
    db.query(SurveyQuestion).filter(SurveyQuestion.survey_id == survey.id).delete()
    db.commit()

    # 5. Insert the user's custom questions
    saved_questions = []
    for idx, q in enumerate(req.questions):
        sq = SurveyQuestion(
            survey_id=survey.id,
            question_text=q.get("question_text", f"Question {idx+1}"),
            question_type=q.get("question_type", "single_choice"),
            options=q.get("options") or [],
            required=q.get("required", True),
            order_idx=q.get("order_idx", idx + 1)
        )
        db.add(sq)
        saved_questions.append(sq)
    db.commit()
    for sq in saved_questions:
        db.refresh(sq)

    # 6. Execute survey simulation via survey_engine
    persona_dicts = [{
        "id": p.id,
        "name": p.name,
        "segment": p.segment,
        "occupation": p.occupation,
        "schedule": p.schedule,
        "budget": p.budget,
        "food_habits": p.food_habits,
        "dietary_prefs": p.dietary_prefs,
        "delivery_expectations": p.delivery_expectations,
        "tech_familiarity": p.tech_familiarity,
        "motivations": p.motivations or [],
        "frustrations": p.frustrations or [],
        "objections": p.objections or [],
        "consistency_profile": p.consistency_profile or {}
    } for p in target_personas]

    question_dicts = [{
        "id": sq.id,
        "question_text": sq.question_text,
        "question_type": sq.question_type,
        "options": sq.options or []
    } for sq in saved_questions]

    product_dict = {
        "id": product.id if product else "prod-1",
        "name": product.name if product else "Kadappa Cafe",
        "description": product.description if product else "Authentic South Indian Food Delivery",
        "category": product.category if product else "Food Delivery",
        "target_audience": product.target_audience if product else "Working Professionals",
        "features": product.features if product else []
    }

    raw_responses = await survey_engine.execute_survey_batch(persona_dicts, question_dicts, product_dict)

    # 7. Persist responses
    for r in raw_responses:
        sr = SurveyResponse(
            survey_id=survey.id,
            persona_id=r["persona_id"],
            question_id=r["question_id"],
            response_value=str(r["response_value"]),
            reasoning=r.get("reasoning", ""),
            consistency_score=r.get("consistency_score", 0.95)
        )
        db.add(sr)

    # 8. Update experiment metadata
    exp.selected_persona_ids = [p.id for p in target_personas]
    exp.questions_config = [{
        "question_text": sq.question_text,
        "question_type": sq.question_type,
        "options": sq.options
    } for sq in saved_questions]
    exp.status = "completed"
    survey.status = "completed"

    # Score adoption for targeted cohort
    for p_d in persona_dicts:
        try:
            score_res = adoption_scorer.score_persona(p_d, raw_responses)
            existing_score = db.query(AdoptionScore).filter(
                AdoptionScore.experiment_id == exp.id,
                AdoptionScore.persona_id == p_d["id"]
            ).first()
            if existing_score:
                existing_score.overall_score = score_res["overall_score"]
                existing_score.stated_intention = score_res["stated_intention"]
                existing_score.confidence = score_res["confidence"]
                existing_score.drivers = score_res["drivers"]
                existing_score.barriers = score_res["barriers"]
                existing_score.reasoning = score_res["reasoning"]
                existing_score.feature_ratings = score_res["feature_ratings"]
            else:
                new_score = AdoptionScore(
                    experiment_id=exp.id,
                    persona_id=p_d["id"],
                    overall_score=score_res["overall_score"],
                    stated_intention=score_res["stated_intention"],
                    confidence=score_res["confidence"],
                    drivers=score_res["drivers"],
                    barriers=score_res["barriers"],
                    reasoning=score_res["reasoning"],
                    feature_ratings=score_res["feature_ratings"]
                )
                db.add(new_score)
        except Exception:
            pass

    db.commit()

    # 9. Return the complete matrix response immediately
    return get_survey_results_matrix(survey.id, persona_id=None, db=db, current_user=current_user)

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
    persona_id: Optional[str] = Query(None),
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
    if persona_id and persona_id in persona_ids:
        persona_ids = [persona_id]

    personas = db.query(Persona).filter(Persona.id.in_(persona_ids)).all() if persona_ids else []

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
            "occupation": p.occupation,
            "budget": p.budget,
            "schedule": p.schedule,
            "dietary_prefs": p.dietary_prefs,
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
        "experiment_id": survey.experiment_id,
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
