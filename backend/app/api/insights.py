from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import InsightRun, InsightTheme, Experiment, Product, Persona, SurveyResponse, User
from app.schemas.schemas import InsightRunOut
from app.services.insight_agent import insight_agent
from app.api.deps import get_current_user

router = APIRouter(tags=["Insights"])

@router.get("/experiments/{experiment_id}/insights", response_model=Optional[InsightRunOut])
def get_experiment_insights(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(InsightRun).filter(InsightRun.experiment_id == experiment_id).order_by(InsightRun.created_at.desc()).first()
    if not run:
        run = db.query(InsightRun).order_by(InsightRun.created_at.desc()).first()
    return run

@router.post("/experiments/{experiment_id}/insights/run", response_model=InsightRunOut)
async def run_experiment_insights(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    product = db.query(Product).filter(Product.id == exp.product_id).first()
    product_dict = {
        "name": product.name,
        "description": product.description,
        "features": product.features or []
    }

    personas = db.query(Persona).all()
    persona_dicts = [{"id": p.id, "name": p.name, "segment": p.segment} for p in personas]

    responses = db.query(SurveyResponse).join(Experiment, SurveyResponse.survey_id == exp.id).all()
    # Or find responses via survey
    resp_dicts = [{"persona_id": r.persona_id, "response_value": r.response_value, "reasoning": r.reasoning} for r in responses]

    res = await insight_agent.extract_insights(
        experiment_id=exp.id,
        product=product_dict,
        personas=persona_dicts,
        responses=resp_dicts,
        interviews=[]
    )

    db.query(InsightRun).filter(InsightRun.experiment_id == exp.id).delete()
    db.commit()

    i_run = InsightRun(
        experiment_id=exp.id,
        summary=res["summary"],
        themes_count=res["themes_count"],
        sentiment_breakdown=res["sentiment_breakdown"],
        adoption_rate=res["adoption_rate"]
    )
    db.add(i_run)
    db.commit()
    db.refresh(i_run)

    for t in res["themes"]:
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
    db.refresh(i_run)
    return i_run
