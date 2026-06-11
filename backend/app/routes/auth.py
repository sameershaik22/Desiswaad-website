from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
import httpx
from app.routes.email_service import send_password_reset_email

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "secret")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "avatar": current_user.avatar
    }

@router.put("/profile")
def update_profile(data: schemas.UserProfileUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update logged-in user's name and/or phone."""
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip()
    db.commit()
    db.refresh(current_user)
    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "avatar": current_user.avatar
        }
    }

@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token({"sub": new_user.email})
    return {"token": token, "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email, "phone": new_user.phone, "avatar": None}}

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    # Google-only accounts have no password_hash
    if not db_user or not db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": db_user.email})
    return {"token": token, "user": {"id": db_user.id, "name": db_user.name, "email": db_user.email, "phone": db_user.phone, "avatar": db_user.avatar}}

@router.post("/google")
def google_auth(payload: schemas.GoogleAuth, db: Session = Depends(get_db)):
    """
    Verify Google id_token with Google's tokeninfo API.
    If user exists → fetch and return JWT.
    If user is new  → create account, return JWT.
    """
    # Verify the Google id_token
    try:
        resp = httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.id_token},
            timeout=10.0
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        google_data = resp.json()
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Could not reach Google servers")

    # Validate audience matches our client ID
    google_client_id = os.getenv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "")
    if google_client_id and google_data.get("aud") != google_client_id:
        raise HTTPException(status_code=401, detail="Token audience mismatch")

    google_id = google_data.get("sub")
    email = google_data.get("email")
    name = google_data.get("name", email)
    avatar = google_data.get("picture")

    if not google_id or not email:
        raise HTTPException(status_code=400, detail="Incomplete Google profile data")

    # Look up by google_id first (fastest path)
    db_user = db.query(models.User).filter(models.User.google_id == google_id).first()

    if not db_user:
        # Maybe they registered with email/password before — link accounts
        db_user = db.query(models.User).filter(models.User.email == email).first()
        if db_user:
            db_user.google_id = google_id
            db_user.avatar = avatar or db_user.avatar
            db.commit()
            db.refresh(db_user)
        else:
            # Brand-new user — create account
            db_user = models.User(
                name=name,
                email=email,
                google_id=google_id,
                avatar=avatar,
                password_hash=None  # Google-only account
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
    else:
        # Update avatar if it changed
        if avatar and db_user.avatar != avatar:
            db_user.avatar = avatar
            db.commit()
            db.refresh(db_user)

    token = create_access_token({"sub": db_user.email})
    return {
        "token": token,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "phone": db_user.phone,
            "avatar": db_user.avatar
        }
    }


def create_password_reset_token(email: str):
    to_encode = {"sub": email, "type": "reset"}
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Look up user by email
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if user:
        # Generate token
        token = create_password_reset_token(user.email)
        # Send reset email
        send_password_reset_email(user.email, token)
    
    # Always return success to prevent email enumeration
    return {"success": True, "message": "If the email is registered, a password reset link has been sent."}


@router.post("/reset-password")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        if not email or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update password
    hashed_password = pwd_context.hash(req.new_password)
    user.password_hash = hashed_password
    db.commit()
    return {"success": True, "message": "Password has been successfully updated"}

