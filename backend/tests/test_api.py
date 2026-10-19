import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.vector_memory import vector_memory
from app.services.adoption_scorer import adoption_scorer
from app.services.validation_engine import validation_engine

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "REGALUX AI" in data["service"]

def test_auth_login_and_me():
    response = client.post("/api/auth/login", json={
        "email": "researcher@regalux.ai",
        "password": "RoyalSecret2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "researcher@regalux.ai"

def test_list_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 1
    product = next((p for p in products if "Kadappa" in p["name"] or "SwiftBite" in p["name"]), None)
    assert product is not None
    assert len(product["features"]) == 5

def test_list_personas_and_segments():
    response = client.get("/api/personas")
    assert response.status_code == 200
    personas = response.json()
    assert len(personas) >= 8
    names = [p["name"] for p in personas]
    assert "Arjun Sharma" in names
    assert "Pooja Hegde" in names

def test_experiments_list():
    response = client.get("/api/experiments")
    assert response.status_code == 200
    exps = response.json()
    assert len(exps) >= 1

def test_vector_memory_retrieval():
    memories = [
        {"memory_text": "Persona is allergic to peanuts and prefers strict pure vegetarian food."},
        {"memory_text": "Works as a software engineer with daily 10 AM standups."},
        {"memory_text": "Prefers ordering lunch within 30 minutes due to back-to-back meetings."}
    ]
    query = "Does the participant have dietary restrictions or allergies?"
    results = vector_memory.retrieve_relevant(query, memories, top_k=1)
    assert len(results) == 1
    assert "allergic" in results[0]["memory_text"]

def test_adoption_scoring_formula():
    mock_persona = {
        "id": "test-p1",
        "name": "Test Persona",
        "segment": "Time-pressed corporate professional",
        "occupation": "Tech Lead",
        "consistency_profile": {
            "time_sensitivity": 9.5,
            "health_importance": 8.0,
            "subscription_interest": 9.0,
            "willingness_to_pay_delivery_fee": "high"
        }
    }
    score_res = adoption_scorer.score_persona(mock_persona, [])
    assert score_res["overall_score"] >= 75.0
    assert score_res["stated_intention"] == "High"
    assert "30-Minute Guaranteed Delivery" in score_res["drivers"]

def test_validation_engine_contradiction_detection():
    mock_persona = [{
        "id": "p-budget",
        "name": "Budget Associate",
        "segment": "Budget-conscious office employee",
        "consistency_profile": {"willingness_to_pay_delivery_fee": "very_low"}
    }]
    mock_responses = [{
        "persona_id": "p-budget",
        "question_text": "Is ₹99 delivery fee acceptable?",
        "response_value": "Completely Acceptable",
        "reasoning": "Looks fine."
    }]
    val_res = validation_engine.evaluate_experiment(mock_persona, [], mock_responses)
    assert val_res["contradiction_count"] >= 1
    assert len(val_res["warnings"]) >= 1

def test_scenarios_and_cross_domain_evaluation():
    scenarios_resp = client.get("/api/scenarios")
    assert scenarios_resp.status_code == 200
    scenarios = scenarios_resp.json()
    assert len(scenarios) == 5

    eval_resp = client.post("/api/scenarios/run-cross-domain-tests")
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["status"] == "completed"
    assert eval_data["total_scenarios_evaluated"] == 5
    assert eval_data["total_checks_failed"] == 0
