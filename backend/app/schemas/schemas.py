from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "Principal Researcher"

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

# Workspace
class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Product
class FeatureItem(BaseModel):
    id: str
    title: str
    description: str

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    target_audience: str
    geographic_market: Optional[str] = "Metro India"
    features: List[Dict[str, Any]] = []

class ProductOut(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: str
    category: str
    target_audience: str
    geographic_market: str
    features: List[Dict[str, Any]]
    created_at: datetime
    class Config:
        from_attributes = True

# Persona
class PersonaCreate(BaseModel):
    name: str
    avatar: Optional[str] = None
    age: Optional[int] = 30
    occupation: str
    segment: str
    schedule: Optional[str] = None
    budget: Optional[str] = None
    food_habits: Optional[str] = None
    dietary_prefs: Optional[str] = None
    delivery_expectations: Optional[str] = None
    tech_familiarity: Optional[str] = "High"
    motivations: List[str] = []
    frustrations: List[str] = []
    objections: List[str] = []
    feature_preferences: List[str] = []
    communication_style: Optional[str] = None
    behavioral_tendencies: List[str] = []
    assumptions: List[str] = []
    consistency_profile: Dict[str, Any] = {}

class PersonaGenerateRequest(BaseModel):
    product_description: Optional[str] = "Kadappa Cafe — Authentic South Indian & Smart Food Delivery App"
    target_market: Optional[str] = "Working professionals in Metro India"
    count: int = 4
    need_description: Optional[str] = None
    segment_focus: Optional[str] = None
    routine_schedule: Optional[str] = None
    monthly_budget: Optional[str] = None
    dietary_prefs: Optional[str] = None
    delivery_expectations: Optional[str] = None
    fee_sensitivity: Optional[str] = None
    custom_instructions: Optional[str] = None

class PersonaOut(BaseModel):
    id: str
    workspace_id: str
    name: str
    avatar: Optional[str]
    age: Optional[int]
    occupation: str
    segment: str
    schedule: Optional[str]
    budget: Optional[str]
    food_habits: Optional[str]
    dietary_prefs: Optional[str]
    delivery_expectations: Optional[str]
    tech_familiarity: str
    motivations: List[str]
    frustrations: List[str]
    objections: List[str]
    feature_preferences: List[str]
    communication_style: Optional[str]
    behavioral_tendencies: List[str]
    assumptions: List[str]
    consistency_profile: Dict[str, Any]
    created_at: datetime
    class Config:
        from_attributes = True

# Experiment
class ExperimentCreate(BaseModel):
    product_id: str
    title: str
    objective: str
    primary_question: Optional[str] = None
    primary_research_question: Optional[str] = None
    method: Optional[str] = "both"
    selected_persona_ids: Optional[List[str]] = []
    cohort_definition: Optional[Dict[str, Any]] = None
    questions_config: Optional[List[Dict[str, Any]]] = []
    questions: Optional[List[Dict[str, Any]]] = None

class ExperimentOut(BaseModel):
    id: str
    workspace_id: str
    product_id: str
    title: str
    objective: str
    primary_question: str
    method: str
    status: str
    selected_persona_ids: List[str]
    questions_config: List[Dict[str, Any]]
    created_at: datetime
    completed_at: Optional[datetime]
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

# Survey
class SurveyQuestionCreate(BaseModel):
    question_text: str
    question_type: str = "single_choice" # single_choice, multiple_choice, yes_no, rating_scale, likert, open_ended, ranking
    options: List[str] = []
    required: bool = True
    order_idx: int = 0

class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[SurveyQuestionCreate]

class SurveyRunCustomRequest(BaseModel):
    experiment_id: Optional[str] = None
    product_id: Optional[str] = None
    title: Optional[str] = "Custom Targeted Persona Survey"
    persona_scope: str = "all" # "single", "selected", "all"
    persona_ids: Optional[List[str]] = []
    questions: List[Dict[str, Any]] = []

class SurveyResponseOut(BaseModel):
    id: str
    survey_id: str
    persona_id: str
    persona_name: Optional[str] = None
    persona_segment: Optional[str] = None
    question_id: str
    response_value: str
    reasoning: Optional[str]
    consistency_score: float
    created_at: datetime

# Interview
class InterviewStartRequest(BaseModel):
    experiment_id: str
    persona_id: str
    title: Optional[str] = "Persona Discovery Session"

class MessageCreate(BaseModel):
    content: str

class InterviewMessageOut(BaseModel):
    id: str
    session_id: str
    sender: str
    content: str
    reasoning: Optional[str] = None
    retrieved_memories: List[Dict[str, Any]] = []
    timestamp: datetime
    class Config:
        from_attributes = True

class InterviewSessionOut(BaseModel):
    id: str
    experiment_id: str
    persona_id: str
    title: str
    notes: Optional[str]
    status: str
    created_at: datetime
    persona: Optional[PersonaOut] = None
    messages: List[InterviewMessageOut] = []
    class Config:
        from_attributes = True

# Insights
class InsightThemeOut(BaseModel):
    id: str
    title: str
    summary: str
    category: str
    sentiment: str
    relevant_segments: List[str]
    supporting_quotes: List[Dict[str, Any]]
    participant_count: int
    counterexamples: Optional[str]
    confidence: float
    product_implication: Optional[str]
    limitations: Optional[str]

class InsightRunOut(BaseModel):
    id: str
    experiment_id: str
    summary: str
    themes_count: int
    sentiment_breakdown: Dict[str, Any]
    adoption_rate: float
    created_at: datetime
    themes: List[InsightThemeOut] = []

# Adoption
class AdoptionScoreOut(BaseModel):
    id: str
    experiment_id: str
    persona_id: str
    persona_name: Optional[str] = None
    persona_segment: Optional[str] = None
    overall_score: float
    stated_intention: str
    confidence: float
    drivers: List[str]
    barriers: List[str]
    reasoning: str
    feature_ratings: Dict[str, Any]

class SegmentAdoptionOut(BaseModel):
    segment: str
    count: int
    mean_score: float
    intent_breakdown: Dict[str, int]
    top_feature: str
    main_objection: str
    reasoning: str

# Validation
class ValidationRunOut(BaseModel):
    id: str
    experiment_id: str
    overall_score: float
    profile_alignment_score: float
    relevance_score: float
    contradiction_count: int
    warnings: List[Dict[str, Any]]
    details: Dict[str, Any]
    created_at: datetime

# Scenario
class ScenarioOut(BaseModel):
    id: str
    key: str
    title: str
    category: str
    target_audience: str
    description: str
    features: List[Dict[str, Any]]
    survey_questions: List[Dict[str, Any]]
    interview_questions: List[str]
    personas: List[Dict[str, Any]]
    validation_checks: List[Dict[str, Any]]
    created_at: datetime
    class Config:
        from_attributes = True

# Settings
class SettingsOut(BaseModel):
    groq_api_key_configured: bool
    groq_model: str
    openai_api_key_configured: bool = False
    openai_model: str = "gpt-4o-mini"
    ai_provider: str = "auto"
    demo_mode: bool
    database_url: str

class SettingsUpdate(BaseModel):
    groq_api_key: Optional[str] = None
    groq_model: Optional[str] = None
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = None
    ai_provider: Optional[str] = None
    demo_mode: Optional[bool] = None
