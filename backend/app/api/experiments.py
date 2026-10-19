from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import (
    Experiment, Product, Persona, Survey, SurveyQuestion, SurveyResponse,
    InsightRun, InsightTheme, AdoptionScore, ValidationRun, Workspace, User
)
from app.schemas.schemas import ExperimentCreate, ExperimentOut
from app.services.survey_engine import survey_engine
from app.services.adoption_scorer import adoption_scorer
from app.services.validation_engine import validation_engine
from app.services.insight_agent import insight_agent
from app.api.deps import get_current_user

router = APIRouter(prefix="/experiments", tags=["Experiments"])

@router.get("", response_model=List[ExperimentOut])
def list_experiments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Experiment).order_by(Experiment.created_at.desc()).all()

@router.post("", response_model=ExperimentOut)
def create_experiment(exp_in: ExperimentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ws = db.query(Workspace).filter(Workspace.owner_id == current_user.id).first()
    if not ws:
        ws = Workspace(name="Default Research Lab", owner_id=current_user.id)
        db.add(ws)
        db.commit()
        db.refresh(ws)

    product = db.query(Product).filter(Product.id == exp_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Resolve selected personas: single persona, selected personas, or all personas
    selected_personas = exp_in.selected_persona_ids or []
    if not selected_personas and exp_in.cohort_definition:
        selected_personas = exp_in.cohort_definition.get("persona_ids", [])
    if not selected_personas:
        # Default to all available personas if none specified
        all_p = db.query(Persona).all()
        selected_personas = [p.id for p in all_p]

    primary_q = exp_in.primary_question or exp_in.primary_research_question or "Validation Study"
    configured_questions = exp_in.questions_config or exp_in.questions or []

    exp = Experiment(
        workspace_id=ws.id,
        product_id=product.id,
        title=exp_in.title,
        objective=exp_in.objective,
        primary_question=primary_q,
        method=exp_in.method or "both",
        status="draft",
        selected_persona_ids=selected_personas,
        questions_config=configured_questions
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    # Initialize associated survey
    survey = Survey(
        experiment_id=exp.id,
        title=f"Survey: {exp.title}",
        description=f"Targeted persona survey testing {product.name}",
        status="pending"
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)

    # Default questions only if user provided none
    questions = configured_questions
    if not questions:
        questions = [
            {
                "question_text": f"How likely are you to use a 30-minute express breakfast delivery service from {product.name}?",
                "question_type": "rating_scale",
                "options": ["1 - Very Unlikely", "2 - Unlikely", "3 - Neutral", "4 - Likely", "5 - Very Likely"],
                "required": True,
                "order_idx": 1
            },
            {
                "question_text": "Is a ₹99 delivery fee acceptable for guaranteed 30-minute delivery SLA?",
                "question_type": "single_choice",
                "options": ["Completely Acceptable", "Acceptable if SLA is guaranteed", "Neutral / Conditional", "Unacceptable / Too High"],
                "required": True,
                "order_idx": 2
            },
            {
                "question_text": "How important is a dedicated, nutrient-verified healthy South Indian food section (millet idlis, low-GI) to your ordering decisions?",
                "question_type": "rating_scale",
                "options": ["1", "2", "3", "4", "5"],
                "required": True,
                "order_idx": 3
            },
            {
                "question_text": "Would you subscribe to a monthly morning pass (₹199/mo) offering unlimited free 30-min deliveries?",
                "question_type": "single_choice",
                "options": ["Very Likely", "Moderately Likely", "Unlikely"],
                "required": True,
                "order_idx": 4
            },
            {
                "question_text": f"What is your single biggest concern or barrier regarding adopting {product.name}?",
                "question_type": "open_ended",
                "options": [],
                "required": True,
                "order_idx": 5
            }
        ]
        # Keep exp questions_config updated
        exp.questions_config = questions
        db.commit()

    for idx, q in enumerate(questions):
        sq = SurveyQuestion(
            survey_id=survey.id,
            question_text=q.get("question_text"),
            question_type=q.get("question_type", "single_choice"),
            options=q.get("options", []),
            required=q.get("required", True),
            order_idx=q.get("order_idx", idx + 1)
        )
        db.add(sq)
    
    db.commit()
    return exp

@router.get("/{experiment_id}", response_model=ExperimentOut)
def get_experiment(experiment_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@router.post("/{experiment_id}/run", response_model=ExperimentOut)
async def run_experiment_pipeline(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes the comprehensive research simulation pipeline:
    1. Loads selected personas and survey questions.
    2. Executes survey batch asynchronously across personas.
    3. Runs adoption scoring per persona and segment.
    4. Evaluates persona consistency and realism.
    5. Extracts structured insights with supporting quotes.
    6. Updates experiment status to 'completed'.
    """
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    exp.status = "running"
    db.commit()

    product = db.query(Product).filter(Product.id == exp.product_id).first()
    product_dict = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "target_audience": product.target_audience,
        "features": product.features or []
    }

    # Load personas
    p_ids = exp.selected_persona_ids or []
    personas = db.query(Persona).filter(Persona.id.in_(p_ids)).all() if p_ids else db.query(Persona).all()
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
    } for p in personas]

    # Load Survey and Questions
    survey = db.query(Survey).filter(Survey.experiment_id == exp.id).first()
    if not survey:
        survey = Survey(experiment_id=exp.id, title=f"Survey: {exp.title}", status="running")
        db.add(survey)
        db.commit()
        db.refresh(survey)

    questions = db.query(SurveyQuestion).filter(SurveyQuestion.survey_id == survey.id).order_by(SurveyQuestion.order_idx).all()
    question_dicts = [{
        "id": q.id,
        "question_text": q.question_text,
        "question_type": q.question_type,
        "options": q.options or []
    } for q in questions]

    # Step 1: Run survey batch
    raw_responses = await survey_engine.execute_survey_batch(persona_dicts, question_dicts, product_dict)
    
    # Clear existing survey responses for clean re-run
    db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey.id).delete()
    db.commit()

    saved_responses = []
    for r in raw_responses:
        sr = SurveyResponse(
            survey_id=survey.id,
            persona_id=r["persona_id"],
            question_id=r["question_id"],
            response_value=str(r["response_value"]),
            reasoning=r.get("reasoning", ""),
            consistency_score=r.get("consistency_score", 1.0)
        )
        db.add(sr)
        saved_responses.append(r)
    db.commit()

    # Step 2: Adoption Scoring
    db.query(AdoptionScore).filter(AdoptionScore.experiment_id == exp.id).delete()
    db.commit()

    adoption_records = []
    for p_d in persona_dicts:
        score_res = adoption_scorer.score_persona(p_d, saved_responses)
        rec = AdoptionScore(
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
        db.add(rec)
        adoption_records.append(score_res)
    db.commit()

    # Step 3: Persona Validation Engine
    val_res = validation_engine.evaluate_experiment(persona_dicts, question_dicts, saved_responses)
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

    # Step 4: Insight Extraction Agent
    # Load any interview sessions
    interviews = []
    insight_res = await insight_agent.extract_insights(
        experiment_id=exp.id,
        product=product_dict,
        personas=persona_dicts,
        responses=saved_responses,
        interviews=interviews
    )

    db.query(InsightRun).filter(InsightRun.experiment_id == exp.id).delete()
    db.commit()

    i_run = InsightRun(
        experiment_id=exp.id,
        summary=insight_res["summary"],
        themes_count=insight_res["themes_count"],
        sentiment_breakdown=insight_res["sentiment_breakdown"],
        adoption_rate=insight_res["adoption_rate"]
    )
    db.add(i_run)
    db.commit()
    db.refresh(i_run)

    for t in insight_res["themes"]:
        theme_rec = InsightTheme(
            run_id=i_run.id,
            title=t["title"],
            summary=t["summary"],
            category=t["category"],
            sentiment=t["sentiment"],
            relevant_segments=t["relevant_segments"],
            supporting_quotes=t["supporting_quotes"],
            participant_count=t["participant_count"],
            counterexamples=t.get("counterexamples"),
            confidence=t.get("confidence", 0.9),
            product_implication=t.get("product_implication"),
            limitations=t.get("limitations")
        )
        db.add(theme_rec)
    db.commit()

    # Mark experiment completed
    exp.status = "completed"
    exp.completed_at = datetime.utcnow()
    survey.status = "completed"
    db.commit()
    db.refresh(exp)

    return exp
