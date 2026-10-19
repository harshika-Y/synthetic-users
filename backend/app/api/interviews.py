from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import InterviewSession, InterviewMessage, Persona, Experiment, Product, PersonaMemory, User
from app.schemas.schemas import InterviewSessionOut, MessageCreate, InterviewMessageOut, InterviewStartRequest
from app.services.interview_engine import interview_engine
from app.services.vector_memory import vector_memory
from app.api.deps import get_current_user

router = APIRouter(tags=["Interviews"])

@router.get("/interviews", response_model=List[InterviewSessionOut])
def list_interview_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InterviewSession).order_by(InterviewSession.created_at.desc()).all()

@router.post("/personas/{persona_id}/interviews", response_model=InterviewSessionOut)
def start_interview_for_persona(
    persona_id: str,
    req: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        persona = db.query(Persona).first()
    if not persona:
        raise HTTPException(status_code=404, detail="No personas available")

    # Ensure experiment_id is valid
    exp = db.query(Experiment).filter(Experiment.id == req.experiment_id).first() if req.experiment_id else None
    if not exp:
        exp = db.query(Experiment).first()
    if not exp:
        product = db.query(Product).first()
        exp = Experiment(
            title="Customer Discovery & Validation",
            objective="Understand customer habits, dietary needs, and delivery expectations",
            primary_question="Would customers adopt Kadappa Cafe and express delivery services?",
            method="both",
            status="active",
            product_id=product.id if product else None,
            workspace_id=persona.workspace_id
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)

    session = InterviewSession(
        experiment_id=exp.id,
        persona_id=persona.id,
        title=req.title or f"Discovery Interview: {persona.name}",
        status="active"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Initial opening greeting from persona (warm, friendly human greeting)
    initial_msg = InterviewMessage(
        session_id=session.id,
        sender="persona",
        content=f"Hey! I'm {persona.name}. Great to connect with you today! I'm happy to take a quick break and chat. How are you doing today?",
        reasoning=f"Warm, friendly human opening from {persona.name} ({persona.occupation})."
    )
    db.add(initial_msg)
    db.commit()
    db.refresh(session)
    return session

@router.get("/interviews/{session_id}", response_model=InterviewSessionOut)
def get_interview_session(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/interviews/{session_id}/messages", response_model=InterviewMessageOut)
async def send_interview_message(
    session_id: str,
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    persona = db.query(Persona).filter(Persona.id == session.persona_id).first()
    if not persona:
        persona = db.query(Persona).first()
        if persona:
            session.persona_id = persona.id
            db.commit()
        else:
            raise HTTPException(status_code=404, detail="Persona not found")

    exp = db.query(Experiment).filter(Experiment.id == session.experiment_id).first()
    product = db.query(Product).filter(Product.id == exp.product_id).first() if exp and exp.product_id else None

    product_dict = {
        "name": product.name if product else "Kadappa Cafe",
        "description": product.description if product else "Authentic South Indian & Express Food Delivery"
    }

    # 1. Save researcher's message
    user_msg = InterviewMessage(
        session_id=session.id,
        sender="researcher",
        content=msg_in.content
    )
    db.add(user_msg)
    db.commit()

    # 2. Load past messages
    history = db.query(InterviewMessage).filter(InterviewMessage.session_id == session.id).order_by(InterviewMessage.timestamp).all()
    history_dicts = [{"sender": m.sender, "content": m.content} for m in history]

    # 3. Load persona memories
    memories = db.query(PersonaMemory).filter(PersonaMemory.persona_id == persona.id).all()
    memory_dicts = [{"memory_text": m.memory_text, "embedding": m.embedding} for m in memories]

    persona_dict = {
        "id": persona.id,
        "name": persona.name,
        "age": persona.age or 30,
        "occupation": persona.occupation,
        "segment": persona.segment,
        "schedule": persona.schedule,
        "budget": persona.budget,
        "food_habits": persona.food_habits,
        "dietary_prefs": persona.dietary_prefs,
        "delivery_expectations": persona.delivery_expectations,
        "communication_style": persona.communication_style,
        "motivations": persona.motivations or [],
        "frustrations": persona.frustrations or [],
        "objections": persona.objections or []
    }

    # 4. Generate AI persona response
    reply_data = await interview_engine.respond_to_researcher(
        persona=persona_dict,
        message_history=history_dicts,
        new_message=msg_in.content,
        stored_memories=memory_dicts,
        product_context=product_dict
    )

    # 5. Save persona reply
    ai_msg = InterviewMessage(
        session_id=session.id,
        sender="persona",
        content=reply_data["content"],
        reasoning=reply_data["reasoning"],
        retrieved_memories=reply_data.get("retrieved_memories", [])
    )
    db.add(ai_msg)

    # Store new episodic memory from researcher interaction
    new_mem = PersonaMemory(
        persona_id=persona.id,
        experiment_id=session.experiment_id,
        memory_text=f"Discussed with researcher: '{msg_in.content[:80]}'. Persona stated: '{reply_data['content'][:120]}'",
        embedding=vector_memory.embed_text(msg_in.content + " " + reply_data['content'])
    )
    db.add(new_mem)
    db.commit()
    db.refresh(ai_msg)
    return ai_msg
