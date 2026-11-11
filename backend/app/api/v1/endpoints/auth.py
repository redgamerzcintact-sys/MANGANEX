from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
import datetime
import uuid
import os
import secrets
import time
from passlib.context import CryptContext

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = None

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    username: str
    password: str
    organization: Optional[str] = "MOIL Limited"
    role: Optional[str] = "ROLE_GEOLOGIST"

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ── IN-MEMORY STORES & POLICIES ────────────────────────────────────────────────
REVOKED_TOKENS = set()
RESET_TOKENS: Dict[str, Dict] = {} # token -> {email, expires_at}
VERIFICATION_TOKENS: Dict[str, Dict] = {} # token -> {username, email, expires_at}
FAILED_ATTEMPTS: Dict[str, List[float]] = {} # identifier -> list of timestamps
LOCKOUT_THRESHOLD = 5
LOCKOUT_DURATION_SEC = 900 # 15 minutes

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pw(password: str) -> str:
    return pwd_context.hash(password)

ROLE_PERMISSIONS = {
    "ROLE_ADMIN": [
        "SYSTEM_ADMIN", "USER_MANAGEMENT", "ROLE_ASSIGNMENT",
        "DATASET_UPLOAD", "DATASET_DELETE", "MODEL_REGISTER",
        "AUDIT_LOG_VIEW", "GEOLOGY_FULL", "OPS_FULL", "REPORT_GENERATE"
    ],
    "ROLE_GEOLOGIST": [
        "GEOLOGY_READ", "GEOLOGY_WRITE", "BOREHOLE_ASSAY_VIEW",
        "PROSPECTIVITY_RUN", "EXPLORATION_MAP_EXPORT", "SUBSURFACE_3D_VIEW"
    ],
    "ROLE_ENGINEER": [
        "PRODUCTION_READ", "PRODUCTION_WRITE", "EQUIPMENT_STATUS_UPDATE",
        "RISK_EVALUATION", "SCENARIO_SIMULATE", "FORECAST_ANALYZE"
    ],
    "ROLE_ANALYST": [
        "DATASET_VIEW", "DATASET_UPLOAD", "DATA_QUALITY_RUN",
        "AI_MODEL_EVALUATE", "ANALYTICS_EXPORT", "SATELLITE_INDICES_COMPUTE"
    ],
    "ROLE_VIEWER": [
        "DASHBOARD_VIEW", "CADASTRE_VIEW", "APPROVED_REPORTS_VIEW", "MAPS_READONLY"
    ]
}

# Demo credentials are injected at runtime and never committed to source.
# Random per-process fallbacks disable predictable demo logins when unset.
demo_passwords = {
    "admin": os.getenv("MANGANEX_DEMO_ADMIN_PASSWORD") or secrets.token_urlsafe(32),
    "geologist": os.getenv("MANGANEX_DEMO_GEOLOGIST_PASSWORD") or secrets.token_urlsafe(32),
    "engineer": os.getenv("MANGANEX_DEMO_ENGINEER_PASSWORD") or secrets.token_urlsafe(32),
    "analyst": os.getenv("MANGANEX_DEMO_ANALYST_PASSWORD") or secrets.token_urlsafe(32),
    "viewer": os.getenv("MANGANEX_DEMO_VIEWER_PASSWORD") or secrets.token_urlsafe(32),
}

ROLE_ACCOUNTS = {
    "admin": {
        "id": "usr-admin", "username": "admin", "email": "admin@moil.gov.in",
        "fullName": "Director General of Mining Operations", "role": "ROLE_ADMIN",
        "organization": "Ministry of Steel / MOIL",
        "password_hash": hash_pw(demo_passwords["admin"]), "verified": True
    },
    "geologist": {
        "id": "usr-geologist", "username": "geologist", "email": "geologist@moil.gov.in",
        "fullName": "Chief Exploration Geologist", "role": "ROLE_GEOLOGIST",
        "organization": "GSI / MOIL Exploration Wing",
        "password_hash": hash_pw(demo_passwords["geologist"]), "verified": True
    },
    "engineer": {
        "id": "usr-engineer", "username": "engineer", "email": "engineer@moil.gov.in",
        "fullName": "Principal Mine Planning Engineer", "role": "ROLE_ENGINEER",
        "organization": "Balaghat Underground Operations",
        "password_hash": hash_pw(demo_passwords["engineer"]), "verified": True
    },
    "analyst": {
        "id": "usr-analyst", "username": "analyst", "email": "analyst@moil.gov.in",
        "fullName": "Senior Geospatial Data Analyst", "role": "ROLE_ANALYST",
        "organization": "National Mineral Intelligence Unit",
        "password_hash": hash_pw(demo_passwords["analyst"]), "verified": True
    },
    "viewer": {
        "id": "usr-viewer", "username": "viewer", "email": "viewer@moil.gov.in",
        "fullName": "Executive Observer", "role": "ROLE_VIEWER",
        "organization": "Public Mineral Observatory",
        "password_hash": hash_pw(demo_passwords["viewer"]), "verified": True
    }
}

def check_rate_limit(identifier: str):
    now = time.time()
    attempts = FAILED_ATTEMPTS.get(identifier, [])
    # Filter attempts in last 15 mins
    recent_attempts = [t for t in attempts if now - t < LOCKOUT_DURATION_SEC]
    FAILED_ATTEMPTS[identifier] = recent_attempts
    if len(recent_attempts) >= LOCKOUT_THRESHOLD:
        remaining = int(LOCKOUT_DURATION_SEC - (now - recent_attempts[0]))
        raise HTTPException(
            status_code=429,
            detail=f"Security Lockout: 5 consecutive failed sign-in attempts detected. Account temporarily locked for {max(1, remaining // 60)} minutes to protect against brute-force intrusion."
        )

def record_failed_attempt(identifier: str):
    now = time.time()
    if identifier not in FAILED_ATTEMPTS:
        FAILED_ATTEMPTS[identifier] = []
    FAILED_ATTEMPTS[identifier].append(now)

def reset_failed_attempts(identifier: str):
    if identifier in FAILED_ATTEMPTS:
        del FAILED_ATTEMPTS[identifier]

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    uname = req.username.strip().lower()
    email = req.email.strip().lower()
    
    if len(uname) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="A valid official email is required.")
        
    # Check duplicate username
    if uname in ROLE_ACCOUNTS:
        raise HTTPException(status_code=409, detail=f"Username '{uname}' is already registered in MANGANEX.")
    for _, acc in ROLE_ACCOUNTS.items():
        if acc.get("email", "").lower() == email:
            raise HTTPException(status_code=409, detail=f"Email '{email}' is already associated with an existing account.")

    # Check DB if user exists
    existing_db = db.query(User).filter((User.id == uname) | (User.email == email)).first()
    if existing_db:
        raise HTTPException(status_code=409, detail="User with this email or username already exists in database.")

    # Normalize role
    norm_map = {
        "ADMIN": "ROLE_ADMIN", "ROLE_ADMIN": "ROLE_ADMIN",
        "GEOLOGIST": "ROLE_GEOLOGIST", "ROLE_GEOLOGIST": "ROLE_GEOLOGIST",
        "ENGINEER": "ROLE_ENGINEER", "ROLE_ENGINEER": "ROLE_ENGINEER", "MINING_ENGINEER": "ROLE_ENGINEER",
        "ANALYST": "ROLE_ANALYST", "ROLE_ANALYST": "ROLE_ANALYST", "DATA_ANALYST": "ROLE_ANALYST",
        "VIEWER": "ROLE_VIEWER", "ROLE_VIEWER": "ROLE_VIEWER"
    }
    assigned_role = norm_map.get((req.role or "ROLE_GEOLOGIST").strip().upper(), "ROLE_GEOLOGIST")

    uid = f"usr-{uname}-{uuid.uuid4().hex[:6]}"
    p_hash = hash_pw(req.password)

    # Generate verification token
    verification_token = f"verif-{uuid.uuid4().hex}"
    expires_at = time.time() + 86400 # 24 hours
    VERIFICATION_TOKENS[verification_token] = {
        "username": uname,
        "email": email,
        "expires_at": expires_at
    }

    # Store user in memory
    ROLE_ACCOUNTS[uname] = {
        "id": uid,
        "username": uname,
        "email": email,
        "fullName": req.fullName.strip(),
        "role": assigned_role,
        "organization": req.organization or "MOIL Limited",
        "password_hash": p_hash,
        "verified": True  # Seeded as ready to use with verification token available
    }

    # Persist in DB
    try:
        new_db_user = User(
            id=uid,
            name=req.fullName.strip(),
            email=email,
            password_hash=p_hash,
            role=assigned_role,
            organization=req.organization or "MOIL Limited"
        )
        db.add(new_db_user)
        db.commit()
    except Exception as e:
        db.rollback()

    return {
        "success": True,
        "message": f"Account for {req.fullName} successfully registered. Email verification token issued.",
        "verificationToken": verification_token,
        "username": uname,
        "role": assigned_role,
        "email": email
    }

@router.get("/verify-email")
def verify_email(token: str = Query(...)):
    if not token or token not in VERIFICATION_TOKENS:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")
        
    info = VERIFICATION_TOKENS[token]
    if time.time() > info["expires_at"]:
        del VERIFICATION_TOKENS[token]
        raise HTTPException(status_code=400, detail="Verification link has expired. Please request a new one.")
        
    uname = info["username"]
    if uname in ROLE_ACCOUNTS:
        ROLE_ACCOUNTS[uname]["verified"] = True
    del VERIFICATION_TOKENS[token]
    
    return {
        "success": True,
        "message": f"Email {info['email']} successfully verified. You may now sign in."
    }

@router.post("/login")
def login(req: LoginRequest):
    u_key = req.username.lower().strip()
    check_rate_limit(u_key)
    
    # Lookup in role accounts
    target_user = None
    for _, acc in ROLE_ACCOUNTS.items():
        if acc["username"] == u_key or acc["email"].lower() == u_key:
            target_user = acc
            break
            
    if not target_user:
        record_failed_attempt(u_key)
        raise HTTPException(status_code=401, detail="Invalid username or password.")
        
    # Check password
    if not pwd_context.verify(req.password, target_user["password_hash"]):
        record_failed_attempt(u_key)
        raise HTTPException(status_code=401, detail="Invalid username or password.")
        
    # Reset failed attempts on successful credentials
    reset_failed_attempts(u_key)

    if req.role and req.role.strip():
        req_r = req.role.strip().upper()
        user_r = target_user["role"].upper()
        norm_map = {
            "ADMIN": "ROLE_ADMIN", "ROLE_ADMIN": "ROLE_ADMIN",
            "GEOLOGIST": "ROLE_GEOLOGIST", "ROLE_GEOLOGIST": "ROLE_GEOLOGIST",
            "ENGINEER": "ROLE_ENGINEER", "ROLE_ENGINEER": "ROLE_ENGINEER", "MINING_ENGINEER": "ROLE_ENGINEER", "MINING ENGINEER": "ROLE_ENGINEER",
            "ANALYST": "ROLE_ANALYST", "ROLE_ANALYST": "ROLE_ANALYST", "DATA_ANALYST": "ROLE_ANALYST", "DATA ANALYST": "ROLE_ANALYST",
            "VIEWER": "ROLE_VIEWER", "ROLE_VIEWER": "ROLE_VIEWER"
        }
        target_norm = norm_map.get(req_r, req_r)
        if target_norm != user_r and req_r not in user_r and user_r.replace("ROLE_", "") not in req_r:
            raise HTTPException(
                status_code=403, 
                detail="Access denied: Account lacks required role clearance for this mission portal."
            )

    token = f"manganex_jwt_{target_user['username']}_{uuid.uuid4().hex}"
    
    return {
        "success": True,
        "token": token,
        "username": target_user["username"],
        "fullName": target_user["fullName"],
        "role": target_user["role"],
        "organization": target_user.get("organization", "MOIL Limited"),
        "message": "Login successful."
    }

@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
        
    token = authorization.replace("Bearer ", "").strip()
    if token in REVOKED_TOKENS:
        raise HTTPException(status_code=401, detail="Session has been revoked.")
        
    parts = token.split("_")
    username = parts[2] if len(parts) >= 3 else "admin"
    user_acc = ROLE_ACCOUNTS.get(username)
    if not user_acc:
        raise HTTPException(status_code=401, detail="Unknown or unavailable account.")
    
    role = user_acc["role"]
    permissions = ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["ROLE_VIEWER"])
    
    return {
        "success": True,
        "id": user_acc["id"],
        "username": user_acc["username"],
        "email": user_acc["email"],
        "fullName": user_acc["fullName"],
        "role": role,
        "organization": user_acc.get("organization", "MOIL Limited"),
        "permissions": permissions
    }

@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        REVOKED_TOKENS.add(authorization.replace("Bearer ", "").strip())
    return {
        "success": True,
        "message": "Successfully logged out. Session revoked."
    }

@router.post("/refresh")
def refresh_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No active token to refresh.")
        
    old_token = authorization.replace("Bearer ", "").strip()
    if old_token in REVOKED_TOKENS:
        raise HTTPException(status_code=401, detail="Token has been revoked.")
        
    REVOKED_TOKENS.add(old_token)
    parts = old_token.split("_")
    username = parts[2] if len(parts) >= 3 else "admin"
    user_acc = ROLE_ACCOUNTS.get(username, ROLE_ACCOUNTS["admin"])
    
    new_token = f"manganex_jwt_{user_acc['username']}_{uuid.uuid4().hex}"
    
    return {
        "success": True,
        "token": new_token,
        "username": user_acc["username"],
        "fullName": user_acc["fullName"],
        "role": user_acc["role"],
        "message": "Token refreshed successfully."
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Official email is required.")
        
    email_clean = req.email.lower().strip()
    reset_tok = f"rst-{uuid.uuid4().hex[:12]}"
    RESET_TOKENS[reset_tok] = {
        "email": email_clean,
        "expires_at": time.time() + 3600
    }
    
    return {
        "success": True,
        "message": f"Password reset instructions issued for {req.email}. Token: {reset_tok}",
        "resetToken": reset_tok
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    if not req.token or req.token not in RESET_TOKENS:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    info = RESET_TOKENS[req.token]
    if time.time() > info["expires_at"]:
        del RESET_TOKENS[req.token]
        raise HTTPException(status_code=400, detail="Reset token has expired.")

    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
        
    email = info["email"]
    del RESET_TOKENS[req.token]

    for _, acc in ROLE_ACCOUNTS.items():
        if acc["email"].lower() == email:
            acc["password_hash"] = hash_pw(req.new_password)
            return {
                "success": True,
                "message": "Password successfully updated. You may now sign in with your new password."
            }
            
    return {
        "success": True,
        "message": "Password updated."
    }
