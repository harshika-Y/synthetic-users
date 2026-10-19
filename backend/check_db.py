import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.db.database import SessionLocal
from app.models.models import Product, Experiment, Persona

db = SessionLocal()
products = db.query(Product).all()
print("Products:", [(p.id, p.name) for p in products])
experiments = db.query(Experiment).all()
print("Experiments:", [(e.id, e.title) for e in experiments])
personas = db.query(Persona).all()
print(f"Total Personas: {len(personas)}")
db.close()
