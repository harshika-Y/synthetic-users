import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, Base, engine
from app.models.models import (
    User, Workspace, Product, Persona, Experiment, Survey, SurveyQuestion,
    SurveyResponse, InsightRun, InsightTheme, AdoptionScore, ValidationRun,
    Scenario, ResearchReport, InterviewSession, InterviewMessage, PersonaMemory
)
from app.core.security import get_password_hash
from app.services.persona_engine import PERSONA_ARCHETYPES
from app.services.vector_memory import vector_memory

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # 1. Admin/Researcher User
    user = db.query(User).filter(User.email == "researcher@regalux.ai").first()
    if not user:
        user = User(
            email="researcher@regalux.ai",
            hashed_password=get_password_hash("RoyalSecret2026!"),
            full_name="Lady Victoria Vance",
            role="Chief Research Scientist"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 2. Primary Workspace
    ws = db.query(Workspace).filter(Workspace.owner_id == user.id).first()
    if not ws:
        ws = Workspace(
            name="Regalux Obsidian Intelligence Lab",
            description="Enterprise Synthetic Product Discovery & Validation Suite",
            owner_id=user.id
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)

    # 3. Product: Kadappa Cafe
    product = db.query(Product).filter(Product.name.like("%Kadappa Cafe%")).first()
    if not product:
        product = Product(
            workspace_id=ws.id,
            name="Kadappa Cafe — Authentic South Indian & Smart Food Delivery App",
            description="Hyperlocal express South Indian culinary delivery ecosystem delivering hot crispy dosas, filter coffee, and healthy millet meals within a guaranteed 30-minute SLA.",
            category="South Indian Quick-Service & Hyperlocal Food Delivery",
            target_audience="Metro professionals, South Indian breakfast lovers & health-conscious families",
            geographic_market="Metro India (Bengaluru, Hyderabad, Chennai, Bhubaneswar)",
            features=[
                {
                    "id": "f1",
                    "title": "30-Minute Hot Dosa Express Delivery Guarantee",
                    "description": "Piping hot South Indian breakfast & lunch delivered within a strict 30-minute SLA in insulated thermal packaging."
                },
                {
                    "id": "f2",
                    "title": "Dietician-Curated Millet & Pure-Veg Section",
                    "description": "Ragi dosas, multi-millet idlis, zero-soda batters, cold-pressed ghee, and verified diabetic-friendly macro disclosures."
                },
                {
                    "id": "f3",
                    "title": "Kadappa Cafe Morning Pass (₹199/month)",
                    "description": "Unlimited zero-fee morning deliveries, complimentary Kumbakonam filter coffee upgrades, and priority kitchen dispatch."
                },
                {
                    "id": "f4",
                    "title": "Live Kitchen & Rider GPS Tracking",
                    "description": "Real-time pan-to-porch camera tracking and silent arrival notifications avoiding meeting interruptions."
                },
                {
                    "id": "f5",
                    "title": "₹49 – ₹99 Tiered Delivery Fee",
                    "description": "Distance-based logistics fee ensuring fair rider compensation while testing price elasticity."
                }
            ]
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    # 4. Personas (8 Archetypes)
    existing_p_count = db.query(Persona).count()
    created_personas = []
    if existing_p_count == 0:
        for arch in PERSONA_ARCHETYPES:
            p = Persona(
                workspace_id=ws.id,
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
            created_personas.append(p)
        db.commit()
        for p in created_personas:
            db.refresh(p)
    else:
        created_personas = db.query(Persona).all()

    # 5. Preloaded Cross-Domain Scenarios (5 Scenarios)
    if db.query(Scenario).count() == 0:
        scenarios_data = [
            {
                "key": "scenario-swiftbite",
                "title": "SwiftBite — Food Delivery Validation",
                "category": "Hyperlocal & Quick Commerce",
                "target_audience": "Working professionals in Metro India",
                "description": "Validate 30-min SLA, clean nutrition curation, subscription model, and ₹99 delivery fee acceptance.",
                "features": product.features,
                "survey_questions": [
                    {"question_text": "How likely are you to use 30-minute delivery during workdays?", "question_type": "rating_scale"},
                    {"question_text": "Is ₹99 delivery fee acceptable for guaranteed 30-minute speed?", "question_type": "single_choice", "options": ["Completely Acceptable", "Acceptable if SLA guaranteed", "Neutral", "Unacceptable"]},
                    {"question_text": "How important is a dietician-verified healthy section?", "question_type": "rating_scale"},
                    {"question_text": "Would you subscribe to a ₹199/month pass for zero delivery fees?", "question_type": "single_choice", "options": ["Very Likely", "Moderately Likely", "Unlikely"]}
                ],
                "interview_questions": [
                    "Walk me through your typical weekday lunch ordering decision.",
                    "How does an unexpected 20-minute delivery delay impact your schedule?",
                    "What makes you abandon a food delivery checkout cart?"
                ],
                "validation_checks": [
                    {"name": "Budget-to-Fee Coherence", "criteria": "Budget personas must reject high standalone fees."},
                    {"name": "Time Sensitivity Realism", "criteria": "Corporate workers rate 30-min SLA above 8/10."}
                ]
            },
            {
                "key": "scenario-learning",
                "title": "NexLearn — Online Upskilling Platform",
                "category": "EdTech & Career Acceleration",
                "target_audience": "College students & mid-career professionals",
                "description": "Test subscription affordability, AI study companion, flexible scheduling, and verified certificate value.",
                "features": [
                    {"title": "Bite-Sized Modular Lessons", "description": "15-minute interactive video sprints."},
                    {"title": "AI Code Mentor", "description": "Instant line-by-line debugging assistance."},
                    {"title": "₹1,499/Quarter Subscription", "description": "Unlimited access to verified certificates."}
                ],
                "survey_questions": [
                    {"question_text": "How much time per week can you dedicate to upskilling?", "question_type": "single_choice", "options": ["1-3 hours", "4-7 hours", "8+ hours"]},
                    {"question_text": "Is ₹1,499/quarter an affordable investment for career advancement?", "question_type": "rating_scale"}
                ],
                "interview_questions": [
                    "What is your biggest roadblock to completing online courses?",
                    "How important is accredited industry recognition for your resume?"
                ],
                "validation_checks": [
                    {"name": "Student Budget Constraint", "criteria": "College student personas emphasize price sensitivity."}
                ]
            },
            {
                "key": "scenario-fitness",
                "title": "PulseFit — AI Workout & Longevity Companion",
                "category": "HealthTech & Wearables",
                "target_audience": "Beginners and busy desk professionals",
                "description": "Evaluate home workout adherence, biometric posture tracking, and personalized habit streaks.",
                "features": [
                    {"title": "Camera-Based Form Tracking", "description": "Real-time posture corrections via device camera."},
                    {"title": "12-Minute Desk Workouts", "description": "Micro-sessions tailored for sedentary workers."}
                ],
                "survey_questions": [
                    {"question_text": "Would you allow camera-based form correction during workouts?", "question_type": "yes_no"},
                    {"question_text": "How likely are you to complete 12-minute daily movement breaks?", "question_type": "rating_scale"}
                ],
                "interview_questions": [
                    "What made you discontinue your last fitness application?",
                    "How do you currently counter the fatigue of long sedentary work hours?"
                ],
                "validation_checks": [
                    {"name": "Privacy vs Utility Check", "criteria": "Discerning personas raise camera privacy considerations."}
                ]
            },
            {
                "key": "scenario-finance",
                "title": "ArthaWealth — Automated Personal Finance & Wealth Vault",
                "category": "FinTech & Wealth Management",
                "target_audience": "Early to mid-career tech & business professionals",
                "description": "Test automated spare change investing, tax-loss harvesting, and bank-grade data encryption trust.",
                "features": [
                    {"title": "Auto-Roundup Micro Investing", "description": "Rounds up daily UPI spends into diversified index funds."},
                    {"title": "Automated Tax Shield", "description": "Real-time 80C & tax deduction optimization."}
                ],
                "survey_questions": [
                    {"question_text": "How comfortable are you connecting your primary salary account for auto-investing?", "question_type": "likert"},
                    {"question_text": "Would you pay a 0.25% AUM management fee for tax optimization?", "question_type": "single_choice", "options": ["Yes", "Maybe", "No"]}
                ],
                "interview_questions": [
                    "What security credentials do you inspect before trusting a financial app?",
                    "How do you currently manage monthly surplus savings?"
                ],
                "validation_checks": [
                    {"name": "Financial Trust Calibration", "criteria": "Security and bank affiliation must dominate user sentiment."}
                ]
            },
            {
                "key": "scenario-productivity",
                "title": "Chronos Flow — Cognitive Task & Meeting Orchestrator",
                "category": "Enterprise SaaS & Productivity",
                "target_audience": "Founders, product managers, and remote engineering teams",
                "description": "Validate AI calendar conflict resolution, async voice memos, and Slack/Linear integration.",
                "features": [
                    {"title": "Smart Calendar Shield", "description": "Blocks 3-hour uninterrupted deep focus blocks daily."},
                    {"title": "Voice to Linear Action Items", "description": "Converts 60-second voice brainstorms into formatted tickets."}
                ],
                "survey_questions": [
                    {"question_text": "How many hours of context switching do you experience daily?", "question_type": "single_choice", "options": ["<1 hr", "1-2 hrs", "3+ hrs"]},
                    {"question_text": "Would you pay ₹799/month for an app that protects your deep work focus time?", "question_type": "rating_scale"}
                ],
                "interview_questions": [
                    "Describe how an unplanned afternoon meeting disrupts your momentum.",
                    "What feature would make a task management tool indispensable to your day?"
                ],
                "validation_checks": [
                    {"name": "Focus ROI Correlation", "criteria": "High-stress roles show strong willingness to pay for focus."}
                ]
            }
        ]

        for sc in scenarios_data:
            s_obj = Scenario(
                key=sc["key"],
                title=sc["title"],
                category=sc["category"],
                target_audience=sc["target_audience"],
                description=sc["description"],
                features=sc["features"],
                survey_questions=sc["survey_questions"],
                interview_questions=sc["interview_questions"],
                validation_checks=sc["validation_checks"]
            )
            db.add(s_obj)
        db.commit()

    # 6. Preload swiftbite default completed experiment if not present
    exp = db.query(Experiment).filter(Experiment.product_id == product.id).first()
    if not exp:
        exp = Experiment(
            workspace_id=ws.id,
            product_id=product.id,
            title="SwiftBite: Working Professionals Comprehensive Validation",
            objective="Evaluate product adoption probability, 30-min SLA demand, healthy section appeal, and fee price elasticity.",
            primary_question="Would working professionals adopt SwiftBite for daily weekday meal nourishment?",
            method="both",
            status="completed",
            selected_persona_ids=[p.id for p in created_personas],
            completed_at=datetime.utcnow()
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)

        # Survey & Questions
        survey = Survey(
            experiment_id=exp.id,
            title="SwiftBite Value Proposition & Pricing Matrix",
            description="Testing 30-min delivery SLA, ₹99 fee, healthy food section, and monthly subscription tiers.",
            status="completed"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)

        questions = [
            SurveyQuestion(
                survey_id=survey.id,
                question_text="How likely are you to use a 30-minute food delivery service during your workday?",
                question_type="rating_scale",
                options=["1", "2", "3", "4", "5"],
                order_idx=1
            ),
            SurveyQuestion(
                survey_id=survey.id,
                question_text="Is a ₹99 delivery fee acceptable for guaranteed 30-minute delivery?",
                question_type="single_choice",
                options=["Completely Acceptable", "Acceptable if SLA is guaranteed", "Neutral / Conditional", "Unacceptable / Too High"],
                order_idx=2
            ),
            SurveyQuestion(
                survey_id=survey.id,
                question_text="How important is a dedicated, dietician-verified healthy food section with macro breakdowns?",
                question_type="rating_scale",
                options=["1", "2", "3", "4", "5"],
                order_idx=3
            ),
            SurveyQuestion(
                survey_id=survey.id,
                question_text="Would you subscribe to a monthly pass (₹199/mo) offering unlimited free 30-min deliveries?",
                question_type="single_choice",
                options=["Very Likely", "Moderately Likely", "Unlikely"],
                order_idx=4
            ),
            SurveyQuestion(
                survey_id=survey.id,
                question_text="What is your single biggest concern or barrier regarding adopting SwiftBite?",
                question_type="open_ended",
                options=[],
                order_idx=5
            )
        ]
        for q in questions:
            db.add(q)
        db.commit()
        for q in questions:
            db.refresh(q)

        # Responses for all 8 personas
        for p in created_personas:
            p_seg = p.segment
            # Q1
            val_q1 = "5" if "Time-pressed" in p_seg or "Frequent" in p_seg else "4"
            reas_q1 = f"As a {p.occupation}, 30-minute delivery fits directly within my calendar constraints without eating into meeting time."
            db.add(SurveyResponse(survey_id=survey.id, persona_id=p.id, question_id=questions[0].id, response_value=val_q1, reasoning=reas_q1, consistency_score=0.96))

            # Q2 (Fee)
            if "Budget" in p_seg:
                val_q2 = "Unacceptable / Too High"
                reas_q2 = "₹99 delivery fee represents 40% of my average lunch budget of ₹220. Immediate cart abandonment."
            elif "Consultant" in p.occupation or "Premium" in p_seg or "Frequent" in p_seg:
                val_q2 = "Completely Acceptable"
                reas_q2 = "Saving 30 minutes in billable corporate time easily justifies ₹99 as long as the delivery SLA is strictly met."
            else:
                val_q2 = "Neutral / Conditional"
                reas_q2 = "₹99 is steep for single orders, though acceptable for team lunches or when working late."
            db.add(SurveyResponse(survey_id=survey.id, persona_id=p.id, question_id=questions[1].id, response_value=val_q2, reasoning=reas_q2, consistency_score=0.94))

            # Q3 (Healthy)
            val_q3 = "5" if "Health" in p_seg or "Vegetarian" in p_seg else "3"
            reas_q3 = f"Verified macros and clean ingredients prevent the afternoon sugar crash. Critical for my {p.dietary_prefs} regimen."
            db.add(SurveyResponse(survey_id=survey.id, persona_id=p.id, question_id=questions[2].id, response_value=val_q3, reasoning=reas_q3, consistency_score=0.95))

            # Q4 (Subscription)
            val_q4 = "Very Likely" if "Frequent" in p_seg or "Time-pressed" in p_seg or "Premium" in p_seg else "Unlikely"
            reas_q4 = "A ₹199 monthly subscription breaks even in just 2 orders. An obvious financial choice for my weekly routine."
            db.add(SurveyResponse(survey_id=survey.id, persona_id=p.id, question_id=questions[3].id, response_value=val_q4, reasoning=reas_q4, consistency_score=0.93))

            # Q5 (Open-ended Barrier)
            val_q5 = f"Ensuring that speed doesn't compromise food freshness, hot temperature, and spill-proof hygiene during delivery."
            reas_q5 = f"Primary apprehension based on past experiences with delivery logistics in Metro India."
            db.add(SurveyResponse(survey_id=survey.id, persona_id=p.id, question_id=questions[4].id, response_value=val_q5, reasoning=reas_q5, consistency_score=0.92))

        db.commit()

        # Adoption Scores
        for p in created_personas:
            p_seg = p.segment
            if "Budget" in p_seg:
                score = 52.0
                intent = "Moderate"
                drivers = ["30-Minute Guaranteed Delivery"]
                barriers = ["₹99 Standalone Delivery Fee on Small Orders", "Low Daily Food Budget"]
            elif "Time-pressed" in p_seg or "Frequent" in p_seg or "Premium" in p_seg:
                score = 88.5
                intent = "High"
                drivers = ["30-Minute Guaranteed Delivery", "Subscription Plan with Zero Delivery Fees", "Live GPS Order Tracking"]
                barriers = ["Reliability During Peak Rush Traffic"]
            elif "Health" in p_seg:
                score = 84.0
                intent = "High"
                drivers = ["Dietician-Curated Macro Section", "Clean Kitchen Packaging"]
                barriers = ["Need Verification of Nutritional Claims"]
            else:
                score = 65.0
                intent = "Moderate"
                drivers = ["Live Order Tracking", "Regional Veg Variety"]
                barriers = ["₹99 Delivery Fee on Small Baskets"]

            db.add(AdoptionScore(
                experiment_id=exp.id,
                persona_id=p.id,
                overall_score=score,
                stated_intention=intent,
                confidence=0.92,
                drivers=drivers,
                barriers=barriers,
                reasoning=f"{p.name} exhibits {intent.lower()} adoption potential ({score}/100) driven by {drivers[0]}.",
                feature_ratings={"speed": 92, "health": 80, "subscription": 85, "tracking": 90, "fee": 60}
            ))
        db.commit()

        # Validation Run
        db.add(ValidationRun(
            experiment_id=exp.id,
            overall_score=94.5,
            profile_alignment_score=95.0,
            relevance_score=96.0,
            contradiction_count=0,
            warnings=[
                {
                    "persona_name": "Pooja Hegde",
                    "severity": "low",
                    "rule": "High Cart Abandonment Probability",
                    "message": "Persona exhibits severe friction with standalone delivery fees.",
                    "evidence": "Stated ₹99 fee is 40% of lunch ticket."
                }
            ],
            details={"personas_tested": 8, "consistency_benchmark": "Pass", "engine": "Deterministic Semantic Validator"}
        ))
        db.commit()

        # Insight Run & Themes
        i_run = InsightRun(
            experiment_id=exp.id,
            summary="Synthetic research on SwiftBite reveals robust market demand among time-constrained and frequent delivery corporate professionals, anchored by the 30-minute delivery promise and verified healthy food section. However, the ₹99 standalone fee requires bundling into a monthly subscription to capture price-sensitive segments.",
            themes_count=4,
            sentiment_breakdown={"positive": 64, "neutral": 22, "negative": 14},
            adoption_rate=72.5
        )
        db.add(i_run)
        db.commit()
        db.refresh(i_run)

        themes_data = [
            {
                "title": "Severe Price Elasticity on the ₹99 Standalone Delivery Fee",
                "summary": "Working professionals display a sharp bifurcation: high-earning consultants view ₹99 as negligible for guaranteed speed, while junior associates and budget-conscious employees consider it an immediate checkout dealbreaker.",
                "category": "Pricing & Unit Economics",
                "sentiment": "negative",
                "relevant_segments": ["Budget-conscious office employee", "Occasional restaurant-ordering customer"],
                "supporting_quotes": [
                    {"persona_name": "Pooja Hegde", "persona_segment": "Budget-conscious office employee", "quote": "₹99 delivery fee represents 40% of my average lunch budget of ₹220. Immediate cart abandonment.", "source": "Survey Reasoning"}
                ],
                "participant_count": 5,
                "confidence": 0.94,
                "product_implication": "Bundle free delivery into a ₹199 monthly subscription or waive fees above ₹400 basket size."
            },
            {
                "title": "Predictability Outweighs Speed: The 30-Minute SLA as Mental Bandwidth Saver",
                "summary": "The 30-minute delivery guarantee is the highest-rated product pillar across engineering, consulting, and corporate segments. Crucially, participants emphasize arrival predictability over extreme speed.",
                "category": "Delivery SLA & Speed",
                "sentiment": "positive",
                "relevant_segments": ["Time-pressed corporate professional", "Frequent food delivery customer", "Night-shift worker"],
                "supporting_quotes": [
                    {"persona_name": "Arjun Sharma", "persona_segment": "Time-pressed corporate professional", "quote": "As a Senior Software Engineer, 30-minute delivery fits directly within my calendar constraints without eating into meeting time.", "source": "Survey Reasoning"}
                ],
                "participant_count": 7,
                "confidence": 0.96,
                "product_implication": "Feature the 30-minute countdown prominently and guarantee an automatic credit rebate if SLA is breached."
            },
            {
                "title": "Healthy Section Requires Dietician-Audited Macro Disclosures",
                "summary": "Health-conscious and vegetarian personas show high intent to adopt, but express strong skepticism toward unverified 'healthy' labels. They demand transparent macro counts (protein, carbs, calories) and zero refined oils.",
                "category": "Health & Nutrition",
                "sentiment": "positive",
                "relevant_segments": ["Health-conscious working professional", "Vegetarian professional"],
                "supporting_quotes": [
                    {"persona_name": "Dr. Kavita Narayanan", "persona_segment": "Health-conscious working professional", "quote": "Verified macros and clean ingredients prevent the afternoon sugar crash.", "source": "Survey Reasoning"}
                ],
                "participant_count": 4,
                "confidence": 0.92,
                "product_implication": "Partner with certified healthy kitchens and display macro badges directly on restaurant cards."
            },
            {
                "title": "Subscription Plan Serves as the Bridge Across Pricing Objections",
                "summary": "Frequent ordering professionals (ordering >4x weekly) demonstrate an 85%+ willingness to purchase a recurring membership that eliminates the delivery fee and grants priority kitchen dispatch.",
                "category": "Subscription & Monetization",
                "sentiment": "positive",
                "relevant_segments": ["Frequent food delivery customer", "Time-pressed corporate professional", "Premium convenience-focused professional"],
                "supporting_quotes": [
                    {"persona_name": "Rohan Mehra", "persona_segment": "Frequent food delivery customer", "quote": "A ₹199 monthly subscription breaks even in just 2 orders. An obvious financial choice for my weekly routine.", "source": "Survey Reasoning"}
                ],
                "participant_count": 6,
                "confidence": 0.95,
                "product_implication": "Launch SwiftBite Prime at ₹199/month offering unlimited free 30-min deliveries on orders over ₹199."
            }
        ]

        for td in themes_data:
            db.add(InsightTheme(
                run_id=i_run.id,
                title=td["title"],
                summary=td["summary"],
                category=td["category"],
                sentiment=td["sentiment"],
                relevant_segments=td["relevant_segments"],
                supporting_quotes=td["supporting_quotes"],
                participant_count=td["participant_count"],
                confidence=td["confidence"],
                product_implication=td["product_implication"]
            ))
        db.commit()

        # Seed an interview session for Dr. Kavita Narayanan
        kavita = next((p for p in created_personas if "Kavita" in p.name), created_personas[0])
        int_session = InterviewSession(
            experiment_id=exp.id,
            persona_id=kavita.id,
            title="Nutritional Integrity & Fast Delivery Deep-Dive",
            status="active"
        )
        db.add(int_session)
        db.commit()
        db.refresh(int_session)

        db.add(InterviewMessage(
            session_id=int_session.id,
            sender="persona",
            content=f"Hello! I'm Dr. Kavita Narayanan. As a Clinical Research Lead, I'm eager to discuss nutrition, dietary transparency, and meal scheduling for busy hospital shifts.",
            reasoning="Authentic introduction acknowledging medical routine."
        ))
        db.add(InterviewMessage(
            session_id=int_session.id,
            sender="researcher",
            content="Dr. Kavita, what is the single biggest gap you find with food delivery apps when ordering lunch during busy clinic days?"
        ))
        db.add(InterviewMessage(
            session_id=int_session.id,
            sender="persona",
            content="Standard delivery apps use deceptive 'healthy' tags on meals soaked in refined palm oils and high-sodium sauces. When I have three consecutive patient consultations, an oily meal causes a glucose spike and cognitive slump. If SwiftBite provides certified macro disclosures and zero-refined-oil preparations, it would be transformative.",
            reasoning="Clinical critique of commercial restaurant practices and afternoon mental performance."
        ))
        db.commit()

    db.close()
    print("Database successfully seeded with royal precision!")

if __name__ == "__main__":
    seed_database()
