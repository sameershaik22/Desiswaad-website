from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.routes.orders import get_current_user_id

router = APIRouter()

@router.get("/")
def get_addresses(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    addresses = db.query(models.Address).filter(models.Address.user_id == user_id).order_by(models.Address.is_default.desc(), models.Address.created_at.desc()).all()
    return {"addresses": addresses}

@router.post("/")
def create_address(address_req: schemas.AddressCreate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    # If is_default is True, clear is_default on other user addresses
    if address_req.is_default:
        db.query(models.Address).filter(models.Address.user_id == user_id).update({models.Address.is_default: False}, synchronize_session=False)
        
    new_address = models.Address(
        user_id=user_id,
        name=address_req.name,
        recipient_name=address_req.recipient_name,
        phone=address_req.phone,
        address_line=address_req.address_line,
        city=address_req.city,
        state=address_req.state,
        pincode=address_req.pincode,
        country=address_req.country,
        is_default=address_req.is_default
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return {"success": True, "address": new_address}

@router.put("/{address_id}")
def update_address(address_id: int, address_req: schemas.AddressCreate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    address = db.query(models.Address).filter(models.Address.id == address_id, models.Address.user_id == user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    if address_req.is_default:
        db.query(models.Address).filter(models.Address.user_id == user_id).update({models.Address.is_default: False}, synchronize_session=False)
        
    address.name = address_req.name
    address.recipient_name = address_req.recipient_name
    address.phone = address_req.phone
    address.address_line = address_req.address_line
    address.city = address_req.city
    address.state = address_req.state
    address.pincode = address_req.pincode
    address.country = address_req.country
    address.is_default = address_req.is_default
    
    db.commit()
    db.refresh(address)
    return {"success": True, "address": address}

@router.delete("/{address_id}")
def delete_address(address_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    address = db.query(models.Address).filter(models.Address.id == address_id, models.Address.user_id == user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    db.delete(address)
    db.commit()
    return {"success": True}
