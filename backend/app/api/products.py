from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Product, Workspace, User
from app.schemas.schemas import ProductCreate, ProductOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Retrieve products belonging to user's workspaces
    user_ws_ids = [w.id for w in current_user.workspaces]
    if not user_ws_ids:
        # Fallback to all products if no explicit workspace created yet
        return db.query(Product).all()
    return db.query(Product).filter(Product.workspace_id.in_(user_ws_ids)).all()

@router.post("", response_model=ProductOut)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ws = db.query(Workspace).filter(Workspace.owner_id == current_user.id).first()
    if not ws:
        ws = Workspace(name="Default Research Lab", owner_id=current_user.id)
        db.add(ws)
        db.commit()
        db.refresh(ws)

    product = Product(
        workspace_id=ws.id,
        name=product_in.name,
        description=product_in.description,
        category=product_in.category,
        target_audience=product_in.target_audience,
        geographic_market=product_in.geographic_market or "Metro India",
        features=product_in.features or []
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
