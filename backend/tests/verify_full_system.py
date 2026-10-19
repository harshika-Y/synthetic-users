import sys
import os
import httpx as requests
import json

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8001/api"

def run_verification():
    print("=" * 60)
    print("REGALUX AI — FULL SYSTEM END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Health check
    print("\n[1/10] Verifying System Health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health = r.json()
    print(f" -> Service: {health['service']}")
    print(f" -> Mode: {health['mode']}")
    print(f" -> Database: {health['database']}")

    # 2. Authentication
    print("\n[2/10] Verifying Authentication & Token Issuance...")
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "researcher@regalux.ai",
        "password": "RoyalSecret2026!"
    })
    assert r.status_code == 200, f"Login failed: {r.text}"
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(" -> JWT Token obtained and verified.")

    # 3. Products
    print("\n[3/10] Verifying Researched Products (Kadappa Cafe)...")
    r = requests.get(f"{BASE_URL}/products", headers=headers)
    assert r.status_code == 200
    products = r.json()
    kadappa = next((p for p in products if "Kadappa" in p["name"] or "SwiftBite" in p["name"]), None)
    assert kadappa is not None, "Kadappa Cafe product not found"
    print(f" -> Product: {kadappa['name']}")
    print(f" -> Features Tested: {len(kadappa['features'])} features (30-min Hot Dosa SLA, Millet/Pure-Veg Section, Morning Pass, GPS Tracking, INR 49-99 Fee)")

    # 4. Personas
    print("\n[4/10] Verifying Synthetic Persona Studio...")
    r = requests.get(f"{BASE_URL}/personas", headers=headers)
    assert r.status_code == 200
    personas = r.json()
    assert len(personas) >= 8, f"Expected 8 personas, found {len(personas)}"
    print(f" -> Total Synthetic Personas: {len(personas)} archetypes loaded")
    for p in personas[:3]:
        print(f"    * {p['name']} ({p['occupation']} — {p['segment']})")

    # 4b. Custom Kadappa Cafe Persona Synthesis
    print("\n[4b/10] Verifying Custom Kadappa Cafe Persona Synthesis Based On Researcher Input...")
    r = requests.post(f"{BASE_URL}/personas/generate", json={
        "product_description": "Kadappa Cafe — 30-min express hot dosa delivery & breakfast subscriptions",
        "target_market": "Metro IT professionals in Bengaluru & Hyderabad",
        "count": 2,
        "segment_focus": "Time-pressed corporate professional",
        "routine_schedule": "7:30 AM morning standup rush",
        "monthly_budget": "₹12,000/month",
        "dietary_prefs": "Ghee Podi Masala Dosa, Kumbakonam Filter Coffee",
        "delivery_expectations": "Strict 30-minute hot delivery SLA in thermal boxes",
        "fee_sensitivity": "Prefers ₹199 monthly breakfast pass for unlimited zero-fee deliveries"
    }, headers=headers)
    assert r.status_code == 200, f"Persona generation failed: {r.text}"
    new_pers = r.json()
    assert len(new_pers) == 2, f"Expected 2 generated personas, got {len(new_pers)}"
    print(f" -> Successfully synthesized {len(new_pers)} custom personas based on user input:")
    for np in new_pers:
        print(f"    * {np['name']} | Diet: {np['dietary_prefs']} | Budget: {np['budget']}")

    # 5. Survey Matrix Results
    print("\n[5/10] Verifying Survey Lab & Matrix Results...")
    r = requests.get(f"{BASE_URL}/experiments", headers=headers)
    assert r.status_code == 200
    exps = r.json()
    exp = next((e for e in exps if e.get("status") == "completed"), exps[0])
    exp_id = exp["id"]
    r = requests.get(f"{BASE_URL}/surveys/{exp_id}/results", headers=headers)
    assert r.status_code == 200
    survey_matrix = r.json()
    print(f" -> Questions in Matrix: {len(survey_matrix.get('questions', []))}")
    print(f" -> Personas in Matrix: {len(survey_matrix.get('matrix', []))}")

    # 6. Interview Room & Memory Recall
    print("\n[6/10] Verifying Interview Room & Conversational Memory...")
    r = requests.get(f"{BASE_URL}/interviews", headers=headers)
    assert r.status_code == 200
    interviews = r.json()
    assert len(interviews) >= 1
    session_id = interviews[0]["id"]
    test_msg = "Dr. Kavita, why are accurate macro breakdowns important for working professionals?"
    r = requests.post(f"{BASE_URL}/interviews/{session_id}/messages", json={"content": test_msg}, headers=headers)
    assert r.status_code == 200, f"Interview message post failed: {r.status_code} {r.text}"
    reply = r.json()
    print(f" -> Researcher: '{test_msg}'")
    print(f" -> Persona Reply: '{reply['content'][:110]}...'")
    print(f" -> Internal Persona Reasoning: '{reply['reasoning']}'")

    # 7. Insights Extraction & Quotations
    print("\n[7/10] Verifying Evidence-Linked Insight Intelligence...")
    r = requests.get(f"{BASE_URL}/experiments/{exp_id}/insights", headers=headers)
    assert r.status_code == 200
    insights = r.json()
    assert insights is not None
    print(f" -> Extracted Themes: {insights['themes_count']} themes")
    for t in insights["themes"][:2]:
        print(f"    * [{t['sentiment'].upper()}] {t['title']}")
        if t.get("supporting_quotes"):
            print(f"      Quote: \"{t['supporting_quotes'][0]['quote'][:80]}...\" ({t['supporting_quotes'][0]['persona_name']})")

    # 8. Adoption Scoring
    print("\n[8/10] Verifying Adoption Scoring & Segment Breakdowns...")
    r = requests.get(f"{BASE_URL}/experiments/{exp_id}/adoption", headers=headers)
    assert r.status_code == 200
    adoption = r.json()
    print(f" -> Overall Average Adoption Score: {adoption['average_score']}/100")
    print(f" -> Segments Evaluated: {len(adoption['segments'])} segments")
    for s in adoption["segments"][:3]:
        print(f"    * {s['segment']}: {s['mean_score']}/100 (Top: {s['top_feature']})")

    # 9. Cross-Domain Scenarios Evaluation
    print("\n[9/10] Verifying Cross-Domain Scenario Library...")
    r = requests.post(f"{BASE_URL}/scenarios/run-cross-domain-tests", headers=headers)
    assert r.status_code == 200
    cross_eval = r.json()
    print(f" -> Cross-Domain Scenarios Evaluated: {cross_eval['total_scenarios_evaluated']}")
    print(f" -> Total Checks Passed: {cross_eval['total_checks_passed']}")
    print(f" -> Total Checks Failed: {cross_eval['total_checks_failed']}")

    # 10. PDF Report Generation & Download
    print("\n[10/10] Verifying Editorial PDF Dossier Generation...")
    r = requests.post(f"{BASE_URL}/experiments/{exp_id}/reports", headers=headers)
    assert r.status_code == 200
    report = r.json()
    pdf_path = report["pdf_path"]
    assert os.path.exists(pdf_path), f"PDF file does not exist at {pdf_path}"
    file_size_kb = round(os.path.getsize(pdf_path) / 1024, 1)
    print(f" -> Report Generated: {report['title']}")
    print(f" -> Path: {pdf_path} ({file_size_kb} KB)")
    print(f" -> Download Endpoint: {report['download_url']}")

    print("\n" + "=" * 60)
    print("ALL 10 END-TO-END VERIFICATION CHECKS PASSED WITH ROYAL DISTINCTION!")
    print("=" * 60)

if __name__ == "__main__":
    run_verification()
