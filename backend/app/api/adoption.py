from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import AdoptionScore, Persona, Experiment, User
from app.schemas.schemas import AdoptionScoreOut, SegmentAdoptionOut
from app.services.adoption_scorer import adoption_scorer
from app.api.deps import get_current_user

router = APIRouter(tags=["Adoption"])

@router.get("/experiments/{experiment_id}/adoption")
def get_experiment_adoption(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scores = db.query(AdoptionScore).filter(AdoptionScore.experiment_id == experiment_id).all()
    if not scores:
        scores = db.query(AdoptionScore).all()
    if not scores:
        return {"scores": [], "segments": [], "average_score": 0.0}

    # Fetch persona details
    score_dicts = []
    total = 0.0
    for s in scores:
        p = db.query(Persona).filter(Persona.id == s.persona_id).first()
        score_data = {
            "id": s.id,
            "experiment_id": s.experiment_id,
            "persona_id": s.persona_id,
            "persona_name": p.name if p else "Persona",
            "persona_segment": p.segment if p else "General",
            "overall_score": s.overall_score,
            "stated_intention": s.stated_intention,
            "confidence": s.confidence,
            "drivers": s.drivers or [],
            "barriers": s.barriers or [],
            "reasoning": s.reasoning,
            "feature_ratings": s.feature_ratings or {}
        }
        score_dicts.append(score_data)
        total += s.overall_score

    segments = adoption_scorer.aggregate_segments(score_dicts)
    avg_score = round(total / len(scores), 1) if scores else 0.0

    return {
        "scores": score_dicts,
        "segments": segments,
        "average_score": avg_score,
        "formula": "Score = 0.25*Speed + 0.20*Healthy + 0.20*Subscription + 0.15*Tracking + 0.20*FeeTolerance"
    }

@router.post("/experiments/{experiment_id}/adoption/run")
def run_experiment_adoption(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    personas = db.query(Persona).all()
    persona_dicts = [{
        "id": p.id,
        "name": p.name,
        "segment": p.segment,
        "occupation": p.occupation,
        "consistency_profile": p.consistency_profile or {}
    } for p in personas]

    db.query(AdoptionScore).filter(AdoptionScore.experiment_id == experiment_id).delete()
    db.commit()

    saved_scores = []
    for p in persona_dicts:
        res = adoption_scorer.score_persona(p, [])
        rec = AdoptionScore(
            experiment_id=experiment_id,
            persona_id=p["id"],
            overall_score=res["overall_score"],
            stated_intention=res["stated_intention"],
            confidence=res["confidence"],
            drivers=res["drivers"],
            barriers=res["barriers"],
            reasoning=res["reasoning"],
            feature_ratings=res["feature_ratings"]
        )
        db.add(rec)
        saved_scores.append(res)
    db.commit()

    segments = adoption_scorer.aggregate_segments(saved_scores)
    return {
        "scores": saved_scores,
        "segments": segments,
        "status": "success"
    }
