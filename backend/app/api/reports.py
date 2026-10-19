import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import (
    ResearchReport, Experiment, Product, Persona, InsightRun, AdoptionScore, ValidationRun, User
)
from app.services.report_generator import report_generator
from app.services.adoption_scorer import adoption_scorer
from app.api.deps import get_current_user

router = APIRouter(tags=["Reports"])

@router.get("/experiments/{experiment_id}/reports")
def list_experiment_reports(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ResearchReport).filter(ResearchReport.experiment_id == experiment_id).order_by(ResearchReport.generated_at.desc()).all()

@router.post("/experiments/{experiment_id}/reports")
def generate_experiment_report(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    product = db.query(Product).filter(Product.id == exp.product_id).first()
    p_ids = exp.selected_persona_ids or []
    personas = db.query(Persona).filter(Persona.id.in_(p_ids)).all() if p_ids else db.query(Persona).all()
    
    insight_run = db.query(InsightRun).filter(InsightRun.experiment_id == exp.id).order_by(InsightRun.created_at.desc()).first()
    
    # Load adoption
    scores = db.query(AdoptionScore).filter(AdoptionScore.experiment_id == exp.id).all()
    score_dicts = [{
        "persona_id": s.persona_id,
        "persona_segment": next((p.segment for p in personas if p.id == s.persona_id), "General"),
        "overall_score": s.overall_score,
        "stated_intention": s.stated_intention,
        "drivers": s.drivers or [],
        "barriers": s.barriers or []
    } for s in scores]
    segments = adoption_scorer.aggregate_segments(score_dicts)
    adoption_data = {"scores": score_dicts, "segments": segments}

    val_run = db.query(ValidationRun).filter(ValidationRun.experiment_id == exp.id).order_by(ValidationRun.created_at.desc()).first()

    pdf_path = report_generator.generate_pdf_report(
        experiment={
            "id": exp.id,
            "title": exp.title,
            "objective": exp.objective,
            "primary_question": exp.primary_question
        },
        product={
            "name": product.name if product else "Product",
            "category": product.category if product else "Consumer App",
            "target_audience": product.target_audience if product else "Working Professionals",
            "features": product.features if product else []
        },
        personas=[{
            "name": p.name,
            "segment": p.segment,
            "budget": p.budget,
            "delivery_expectations": p.delivery_expectations
        } for p in personas],
        insight_run={
            "summary": insight_run.summary if insight_run else "",
            "themes": [{
                "title": t.title,
                "summary": t.summary,
                "category": t.category,
                "sentiment": t.sentiment,
                "confidence": t.confidence,
                "product_implication": t.product_implication,
                "supporting_quotes": t.supporting_quotes or []
            } for t in insight_run.themes] if insight_run else []
        } if insight_run else None,
        adoption_data=adoption_data,
        validation_run={
            "overall_score": val_run.overall_score if val_run else 92.5,
            "profile_alignment_score": val_run.profile_alignment_score if val_run else 94.0,
            "relevance_score": val_run.relevance_score if val_run else 96.0,
            "contradiction_count": val_run.contradiction_count if val_run else 0
        } if val_run else None
    )

    report = ResearchReport(
        experiment_id=exp.id,
        title=f"Editorial Intelligence Dossier — {exp.title}",
        pdf_path=pdf_path,
        status="ready",
        sections_summary={
            "personas_count": len(personas),
            "themes_count": len(insight_run.themes) if insight_run else 0,
            "adoption_rate": insight_run.adoption_rate if insight_run else 68.5
        }
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "title": report.title,
        "pdf_path": report.pdf_path,
        "status": report.status,
        "generated_at": report.generated_at,
        "download_url": f"/api/reports/{report.id}/download"
    }

@router.get("/reports/{report_id}/download")
def download_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(ResearchReport).filter(ResearchReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")

    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(report.pdf_path),
        headers={"Content-Disposition": f"attachment; filename={os.path.basename(report.pdf_path)}"}
    )
