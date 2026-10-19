import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.db.database import SessionLocal
from app.models.models import Product, Experiment, Survey, SurveyQuestion

db = SessionLocal()

# 1. Update Products
products = db.query(Product).all()
kadappa_features = [
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

for p in products:
    p.name = "Kadappa Cafe — Authentic South Indian & Smart Food Delivery App"
    p.description = "Hyperlocal express South Indian culinary delivery ecosystem delivering hot crispy dosas, filter coffee, and healthy millet meals within a guaranteed 30-minute SLA."
    p.category = "South Indian Quick-Service & Hyperlocal Food Delivery"
    p.target_audience = "Metro professionals, South Indian breakfast lovers & health-conscious families"
    p.features = kadappa_features

# 2. Update Experiments
experiments = db.query(Experiment).all()
for e in experiments:
    if "SwiftBite" in e.title:
        e.title = e.title.replace("SwiftBite", "Kadappa Cafe")
    e.objective = "Evaluate user adoption for Kadappa Cafe's 30-min express hot dosa delivery, healthy millet/pure-veg line, ₹199/mo breakfast subscription pass, live kitchen GPS tracking, and ₹49-₹99 delivery fee elasticity."
    e.primary_question = "Would urban professionals adopt Kadappa Cafe for daily morning hot dosa delivery and breakfast subscriptions?"

# 3. Update Surveys
surveys = db.query(Survey).all()
for s in surveys:
    if "SwiftBite" in s.title:
        s.title = s.title.replace("SwiftBite", "Kadappa Cafe")
    s.description = "Testing Kadappa Cafe 30-min express delivery SLA, ₹49-₹99 fees, healthy millet section, and ₹199 monthly breakfast pass."

db.commit()
print("Successfully aligned database products, experiments, and surveys to Kadappa Cafe!")
db.close()
