from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Persona, Workspace, User
from app.schemas.schemas import PersonaOut, PersonaGenerateRequest, PersonaCreate
from app.services.persona_engine import persona_engine, PERSONA_ARCHETYPES
from app.api.deps import get_current_user
import random

router = APIRouter(prefix="/personas", tags=["Personas"])

@router.get("", response_model=List[PersonaOut])
def list_personas(
    segment: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Persona)
    if segment:
        query = query.filter(Persona.segment == segment)
    personas = query.order_by(Persona.created_at.desc()).all()
    return personas

@router.post("/generate", response_model=List[PersonaOut])
async def generate_personas(
    req: PersonaGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.owner_id == current_user.id).first()
    ws_id = ws.id if ws else "default-ws"

    new_personas_data = await persona_engine.generate_personas(
        workspace_id=ws_id,
        count=req.count,
        target_market=req.target_market or "Working professionals in Metro India",
        product_description=req.product_description or "Kadappa Cafe — Authentic South Indian & Smart Food Delivery App",
        need_description=req.need_description,
        segment_focus=req.segment_focus,
        routine_schedule=req.routine_schedule,
        monthly_budget=req.monthly_budget,
        dietary_prefs=req.dietary_prefs,
        delivery_expectations=req.delivery_expectations,
        fee_sensitivity=req.fee_sensitivity,
        custom_instructions=req.custom_instructions
    )

    created_personas = []
    for p_data in new_personas_data:
        p = Persona(
            workspace_id=ws_id,
            name=p_data.get("name"),
            avatar=p_data.get("avatar"),
            age=p_data.get("age", 30),
            occupation=p_data.get("occupation", "Professional"),
            segment=p_data.get("segment", "General"),
            schedule=p_data.get("schedule"),
            budget=p_data.get("budget"),
            food_habits=p_data.get("food_habits"),
            dietary_prefs=p_data.get("dietary_prefs"),
            delivery_expectations=p_data.get("delivery_expectations"),
            tech_familiarity=p_data.get("tech_familiarity", "High"),
            motivations=p_data.get("motivations", []),
            frustrations=p_data.get("frustrations", []),
            objections=p_data.get("objections", []),
            feature_preferences=p_data.get("feature_preferences", []),
            communication_style=p_data.get("communication_style"),
            behavioral_tendencies=p_data.get("behavioral_tendencies", []),
            assumptions=p_data.get("assumptions", []),
            consistency_profile=p_data.get("consistency_profile", {})
        )
        db.add(p)
        created_personas.append(p)
    
    db.commit()
    if len(created_personas) <= 20:
        for p in created_personas:
            db.refresh(p)
        return created_personas
    else:
        created_ids = [p.id for p in created_personas]
        return db.query(Persona).filter(Persona.id.in_(created_ids)).all()

@router.get("/{persona_id}", response_model=PersonaOut)
def get_persona(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Persona).filter(Persona.id == persona_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Persona not found")
    return p

@router.post("/{persona_id}/regenerate", response_model=PersonaOut)
async def regenerate_persona(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Persona).filter(Persona.id == persona_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Persona not found")
    
    # Dynamically regenerate using our semantic persona engine
    context_prompt = f"{p.occupation} {p.segment} {p.dietary_prefs} {p.schedule}"
    new_data = await persona_engine.generate_personas(
        workspace_id=p.workspace_id,
        count=1,
        need_description=context_prompt
    )
    if new_data:
        item = new_data[0]
        p.name = item["name"]
        p.avatar = item["avatar"]
        p.age = item["age"]
        p.occupation = item["occupation"]
        p.segment = item["segment"]
        p.schedule = item["schedule"]
        p.budget = item["budget"]
        p.food_habits = item["food_habits"]
        p.dietary_prefs = item["dietary_prefs"]
        p.delivery_expectations = item["delivery_expectations"]
        p.motivations = item["motivations"]
        p.frustrations = item["frustrations"]
        p.objections = item["objections"]
        p.feature_preferences = item["feature_preferences"]
        p.consistency_profile = item["consistency_profile"]
        db.commit()
        db.refresh(p)
    return p

@router.delete("/{persona_id}")
def delete_persona(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Persona).filter(Persona.id == persona_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Persona not found")
    db.delete(p)
    db.commit()
    return {"status": "success", "message": f"Persona {persona_id} deleted successfully"}

@router.delete("")
def delete_all_personas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Persona).delete()
    db.commit()
    return {"status": "success", "deleted_count": count}

@router.post("", response_model=PersonaOut)
def create_custom_persona(
    data: PersonaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.owner_id == current_user.id).first()
    ws_id = ws.id if ws else "default-ws"
    p = Persona(
        workspace_id=ws_id,
        name=data.name,
        avatar=data.avatar or "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        age=data.age or 30,
        occupation=data.occupation or "Professional",
        segment=data.segment or "General",
        schedule=data.schedule,
        budget=data.budget,
        food_habits=data.food_habits,
        dietary_prefs=data.dietary_prefs,
        delivery_expectations=data.delivery_expectations,
        tech_familiarity=data.tech_familiarity or "High",
        motivations=data.motivations or [],
        frustrations=data.frustrations or [],
        objections=data.objections or [],
        feature_preferences=data.feature_preferences or [],
        communication_style=data.communication_style,
        behavioral_tendencies=data.behavioral_tendencies or [],
        assumptions=data.assumptions or [],
        consistency_profile=data.consistency_profile or {}
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.post("/reset-defaults", response_model=List[PersonaOut])
def reset_default_personas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ws = db.query(Workspace).filter(Workspace.owner_id == current_user.id).first()
    ws_id = ws.id if ws else "default-ws"
    
    # Delete all current personas
    db.query(Persona).delete()
    db.commit()
    
    # Re-seed the standard archetypes
    created = []
    for arch in PERSONA_ARCHETYPES:
        p = Persona(
            workspace_id=ws_id,
            name=arch["name"],
            avatar=arch["avatar"],
            age=arch["age"],
            occupation=arch["occupation"],
            segment=arch["segment"],
            schedule=arch["schedule"],
            budget=arch["budget"],
            food_habits=arch["food_habits"],
            dietary_prefs=arch["dietary_prefs"],
            delivery_expectations=arch["delivery_expectations"],
            tech_familiarity=arch["tech_familiarity"],
            motivations=arch["motivations"],
            frustrations=arch["frustrations"],
            objections=arch["objections"],
            feature_preferences=arch["feature_preferences"],
            communication_style=arch["communication_style"],
            behavioral_tendencies=arch["behavioral_tendencies"],
            assumptions=arch["assumptions"],
            consistency_profile=arch["consistency_profile"]
        )
        db.add(p)
        created.append(p)
    db.commit()
    for p in created:
        db.refresh(p)
    return created
