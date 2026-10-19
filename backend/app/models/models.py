import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Principal Researcher")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")

class Workspace(Base):
    __tablename__ = "workspaces"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="workspaces")
    products = relationship("Product", back_populates="workspace", cascade="all, delete-orphan")
    personas = relationship("Persona", back_populates="workspace", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="workspace", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    target_audience = Column(String(255), nullable=False)
    geographic_market = Column(String(100), default="Metro India")
    features = Column(JSON, default=list) # List of dicts: [{"id": "f1", "title": "30-minute delivery", "desc": "..."}]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    workspace = relationship("Workspace", back_populates="products")
    experiments = relationship("Experiment", back_populates="product", cascade="all, delete-orphan")

class Persona(Base):
    __tablename__ = "personas"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    avatar = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    occupation = Column(String(255), nullable=False)
    segment = Column(String(100), nullable=False)
    schedule = Column(String(255), nullable=True)
    budget = Column(String(100), nullable=True)
    food_habits = Column(Text, nullable=True)
    dietary_prefs = Column(String(255), nullable=True)
    delivery_expectations = Column(Text, nullable=True)
    tech_familiarity = Column(String(100), default="High")
    motivations = Column(JSON, default=list)
    frustrations = Column(JSON, default=list)
    objections = Column(JSON, default=list)
    feature_preferences = Column(JSON, default=list)
    communication_style = Column(String(255), nullable=True)
    behavioral_tendencies = Column(JSON, default=list)
    assumptions = Column(JSON, default=list)
    consistency_profile = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    workspace = relationship("Workspace", back_populates="personas")
    responses = relationship("SurveyResponse", back_populates="persona", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="persona", cascade="all, delete-orphan")
    memories = relationship("PersonaMemory", back_populates="persona", cascade="all, delete-orphan")
    adoption_scores = relationship("AdoptionScore", back_populates="persona", cascade="all, delete-orphan")

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    objective = Column(Text, nullable=False)
    primary_question = Column(Text, nullable=False)
    method = Column(String(50), default="both") # survey, interview, both
    status = Column(String(50), default="draft") # draft, queued, running, completed, failed
    selected_persona_ids = Column(JSON, default=list)
    questions_config = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    workspace = relationship("Workspace", back_populates="experiments")
    product = relationship("Product", back_populates="experiments")
    surveys = relationship("Survey", back_populates="experiment", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="experiment", cascade="all, delete-orphan")
    insight_runs = relationship("InsightRun", back_populates="experiment", cascade="all, delete-orphan")
    adoption_scores = relationship("AdoptionScore", back_populates="experiment", cascade="all, delete-orphan")
    validation_runs = relationship("ValidationRun", back_populates="experiment", cascade="all, delete-orphan")
    reports = relationship("ResearchReport", back_populates="experiment", cascade="all, delete-orphan")

class Survey(Base):
    __tablename__ = "surveys"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    experiment = relationship("Experiment", back_populates="surveys")
    questions = relationship("SurveyQuestion", back_populates="survey", cascade="all, delete-orphan")
    responses = relationship("SurveyResponse", back_populates="survey", cascade="all, delete-orphan")

class SurveyQuestion(Base):
    __tablename__ = "survey_questions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    survey_id = Column(String(36), ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False) # single_choice, multiple_choice, yes_no, rating_scale, likert, open_ended, ranking
    options = Column(JSON, default=list)
    required = Column(Boolean, default=True)
    order_idx = Column(Integer, default=0)
    
    survey = relationship("Survey", back_populates="questions")
    responses = relationship("SurveyResponse", back_populates="question", cascade="all, delete-orphan")

class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    survey_id = Column(String(36), ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(36), ForeignKey("survey_questions.id", ondelete="CASCADE"), nullable=False)
    response_value = Column(Text, nullable=False) # JSON encoded or string
    reasoning = Column(Text, nullable=True)
    consistency_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    survey = relationship("Survey", back_populates="responses")
    persona = relationship("Persona", back_populates="responses")
    question = relationship("SurveyQuestion", back_populates="responses")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Persona Deep Dive")
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    experiment = relationship("Experiment", back_populates="interviews")
    persona = relationship("Persona", back_populates="interviews")
    messages = relationship("InterviewMessage", back_populates="session", cascade="all, delete-orphan")

class InterviewMessage(Base):
    __tablename__ = "interview_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(50), nullable=False) # researcher, persona
    content = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=True)
    retrieved_memories = Column(JSON, default=list)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("InterviewSession", back_populates="messages")

class PersonaMemory(Base):
    __tablename__ = "persona_memories"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=True)
    memory_text = Column(Text, nullable=False)
    memory_type = Column(String(50), default="episodic") # factual, episodic, preference
    embedding = Column(JSON, nullable=True) # Vector representation for local semantic search
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    persona = relationship("Persona", back_populates="memories")

class InsightRun(Base):
    __tablename__ = "insight_runs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    summary = Column(Text, nullable=False)
    themes_count = Column(Integer, default=0)
    sentiment_breakdown = Column(JSON, default=dict) # {"positive": 65, "neutral": 20, "negative": 15}
    adoption_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    experiment = relationship("Experiment", back_populates="insight_runs")
    themes = relationship("InsightTheme", back_populates="run", cascade="all, delete-orphan")

class InsightTheme(Base):
    __tablename__ = "insight_themes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("insight_runs.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # "Pricing", "Delivery Time", "Convenience", "Health", "Tracking"
    sentiment = Column(String(50), default="neutral") # "positive", "neutral", "negative"
    relevant_segments = Column(JSON, default=list)
    supporting_quotes = Column(JSON, default=list) # List of {"persona_name": "...", "quote": "...", "source": "..."}
    participant_count = Column(Integer, default=0)
    counterexamples = Column(Text, nullable=True)
    confidence = Column(Float, default=0.85)
    product_implication = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    run = relationship("InsightRun", back_populates="themes")

class AdoptionScore(Base):
    __tablename__ = "adoption_scores"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float, nullable=False) # 0 to 100
    stated_intention = Column(String(50), nullable=False) # "High", "Moderate", "Unlikely"
    confidence = Column(Float, default=0.9)
    drivers = Column(JSON, default=list)
    barriers = Column(JSON, default=list)
    reasoning = Column(Text, nullable=False)
    feature_ratings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    experiment = relationship("Experiment", back_populates="adoption_scores")
    persona = relationship("Persona", back_populates="adoption_scores")

class ValidationRun(Base):
    __tablename__ = "validation_runs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float, default=92.5) # 0-100
    profile_alignment_score = Column(Float, default=94.0)
    relevance_score = Column(Float, default=96.0)
    contradiction_count = Column(Integer, default=0)
    warnings = Column(JSON, default=list)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    experiment = relationship("Experiment", back_populates="validation_runs")

class Scenario(Base):
    __tablename__ = "experiment_scenarios"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    key = Column(String(100), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    target_audience = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    features = Column(JSON, default=list)
    survey_questions = Column(JSON, default=list)
    interview_questions = Column(JSON, default=list)
    personas = Column(JSON, default=list)
    validation_checks = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class ResearchReport(Base):
    __tablename__ = "research_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    pdf_path = Column(String(500), nullable=False)
    status = Column(String(50), default="ready")
    sections_summary = Column(JSON, default=dict)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    experiment = relationship("Experiment", back_populates="reports")
