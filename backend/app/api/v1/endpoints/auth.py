from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.entities import User
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time
import uuid

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = None


class DemoLoginRequest(BaseModel):
    role: str


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
RESET_TOKENS: Dict[str, Dict[str, Any]] = {}
VERIFICATION_TOKENS: Dict[str, Dict[str, Any]] = {}
FAILED_ATTEMPTS: Dict[str, List[float]] = {}
LOCKOUT_THRESHOLD = 5
LOCKOUT_DURATION_SEC = 900  # 15 minutes
PBKDF2_ITERATIONS = 310_000

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")


def hash_pw(password: str) -> str:
    """Hash password with a unique 16-byte cryptographic random salt using PBKDF2-HMAC-SHA256."""
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_pw(password: str, stored_hash: str) -> bool:
    """Verify password against stored PBKDF2-HMAC-SHA256 hash in constant time."""
    if not stored_hash or not stored_hash.startswith("pbkdf2_sha256$"):
        return False
    try:
        _, iter_str, salt_hex, dk_hex = stored_hash.split("$", 3)
        iterations = int(iter_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(dk_hex)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def _validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit_or_sym = any(c.isdigit() or not c.isalnum() for c in password)
    if not (has_upper and has_lower and has_digit_or_sym):
        raise HTTPException(
            status_code=400,
            detail="Password must include uppercase, lowercase, and at least one number or special character.",
        )


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def create_access_token(username: str, role: str, user_id: str) -> str:
    """Create an HMAC-SHA256 signed JWT with standard claims (sub, role, uid, iat, exp, jti)."""
    now = int(time.time())
    exp = now + (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": username,
        "role": role,
        "uid": user_id,
        "iat": now,
        "exp": exp,
        "jti": uuid.uuid4().hex,
    }
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    sig = hmac.new(settings.effective_secret_key.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{header_b64}.{payload_b64}.{_b64url_encode(sig)}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """Verify HMAC-SHA256 signature, expiration, and revocation status of a JWT."""
    if not token or token in REVOKED_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid or revoked session token.")
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Malformed authentication token.")

    header_b64, payload_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = hmac.new(
        settings.effective_secret_key.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    try:
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(actual_sig, expected_sig):
            raise HTTPException(status_code=401, detail="Invalid token signature.")
        header = json.loads(_b64url_decode(header_b64).decode("utf-8"))
        if header.get("alg") != "HS256":
            raise HTTPException(status_code=401, detail="Unsupported token algorithm.")
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")

    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=401, detail="Session token has expired.")

    if not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token subject.")

    return payload


ROLE_PERMISSIONS = {
    "ROLE_ADMIN": [
        "SYSTEM_ADMIN", "USER_MANAGEMENT", "ROLE_ASSIGNMENT",
        "DATASET_UPLOAD", "DATASET_DELETE", "MODEL_REGISTER",
        "AUDIT_LOG_VIEW", "GEOLOGY_FULL", "OPS_FULL", "REPORT_GENERATE",
    ],
    "ROLE_GEOLOGIST": [
        "GEOLOGY_READ", "GEOLOGY_WRITE", "BOREHOLE_ASSAY_VIEW",
        "PROSPECTIVITY_RUN", "EXPLORATION_MAP_EXPORT", "SUBSURFACE_3D_VIEW",
    ],
    "ROLE_ENGINEER": [
        "PRODUCTION_READ", "PRODUCTION_WRITE", "EQUIPMENT_STATUS_UPDATE",
        "RISK_EVALUATION", "SCENARIO_SIMULATE", "FORECAST_ANALYZE",
    ],
    "ROLE_ANALYST": [
        "DATASET_VIEW", "DATASET_UPLOAD", "DATA_QUALITY_RUN",
        "AI_MODEL_EVALUATE", "ANALYTICS_EXPORT", "SATELLITE_INDICES_COMPUTE",
    ],
    "ROLE_VIEWER": [
        "DASHBOARD_VIEW", "CADASTRE_VIEW", "APPROVED_REPORTS_VIEW", "MAPS_READONLY",
    ],
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

# Pre-seeded demonstration accounts (stored exclusively as salted PBKDF2 hashes)
ROLE_ACCOUNTS: Dict[str, Dict[str, Any]] = {
    "admin": {
        "id": "usr-admin",
        "username": "admin",
        "email": "admin@moil.gov.in",
        "fullName": "Director General of Mining Operations",
        "role": "ROLE_ADMIN",
        "organization": "Ministry of Steel / MOIL",
        "password_hash": hash_pw(demo_passwords["admin"]),
        "verified": True,
    },
    "geologist": {
        "id": "usr-geologist",
        "username": "geologist",
        "email": "geologist@moil.gov.in",
        "fullName": "Chief Exploration Geologist",
        "role": "ROLE_GEOLOGIST",
        "organization": "GSI / MOIL Exploration Wing",
        "password_hash": hash_pw(demo_passwords["geologist"]),
        "verified": True,
    },
    "engineer": {
        "id": "usr-engineer",
        "username": "engineer",
        "email": "engineer@moil.gov.in",
        "fullName": "Principal Mine Planning Engineer",
        "role": "ROLE_ENGINEER",
        "organization": "Balaghat Underground Operations",
        "password_hash": hash_pw(demo_passwords["engineer"]),
        "verified": True,
    },
    "analyst": {
        "id": "usr-analyst",
        "username": "analyst",
        "email": "analyst@moil.gov.in",
        "fullName": "Senior Geospatial Data Analyst",
        "role": "ROLE_ANALYST",
        "organization": "National Mineral Intelligence Unit",
        "password_hash": hash_pw(demo_passwords["analyst"]),
        "verified": True,
    },
    "viewer": {
        "id": "usr-viewer",
        "username": "viewer",
        "email": "viewer@moil.gov.in",
        "fullName": "Executive Observer",
        "role": "ROLE_VIEWER",
        "organization": "Public Mineral Observatory",
        "password_hash": hash_pw(demo_passwords["viewer"]),
        "verified": True,
    },
}


ROLE_NORMALIZATION_MAP = {
    "ADMIN": "ROLE_ADMIN",
    "ROLE_ADMIN": "ROLE_ADMIN",
    "GEOLOGIST": "ROLE_GEOLOGIST",
    "ROLE_GEOLOGIST": "ROLE_GEOLOGIST",
    "ENGINEER": "ROLE_ENGINEER",
    "ROLE_ENGINEER": "ROLE_ENGINEER",
    "MINING_ENGINEER": "ROLE_ENGINEER",
    "MINING ENGINEER": "ROLE_ENGINEER",
    "ANALYST": "ROLE_ANALYST",
    "ROLE_ANALYST": "ROLE_ANALYST",
    "DATA_ANALYST": "ROLE_ANALYST",
    "DATA ANALYST": "ROLE_ANALYST",
    "VIEWER": "ROLE_VIEWER",
    "ROLE_VIEWER": "ROLE_VIEWER",
}

DEMO_ROLE_KEYS = {
    "ROLE_ADMIN": "admin",
    "ROLE_GEOLOGIST": "geologist",
    "ROLE_ENGINEER": "engineer",
    "ROLE_ANALYST": "analyst",
    "ROLE_VIEWER": "viewer",
}


def _normalize_role(raw: Optional[str], default: str = "ROLE_VIEWER") -> str:
    cleaned = (raw or "").strip().upper()
    if not cleaned:
        return default
    return ROLE_NORMALIZATION_MAP.get(cleaned, default)


def _extract_username(db_user: User) -> str:
    uid = (db_user.id or "").strip()
    if uid.startswith("usr-"):
        suffix = uid[4:]
        if "-" in suffix:
            return suffix.rsplit("-", 1)[0].lower()
        return suffix.lower()
    return uid.lower()


def _account_from_db_user(db_user: User) -> Dict[str, Any]:
    uname = _extract_username(db_user)
    record = {
        "id": db_user.id,
        "username": uname,
        "email": db_user.email,
        "fullName": db_user.name,
        "role": db_user.role,
        "organization": db_user.organization or "MOIL Limited",
        "password_hash": db_user.password_hash,
        "verified": True,
    }
    ROLE_ACCOUNTS.setdefault(uname, record)
    return ROLE_ACCOUNTS[uname]


def _find_account(identifier: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
    key = identifier.strip().lower()
    if not key:
        return None
    if key in ROLE_ACCOUNTS:
        return ROLE_ACCOUNTS[key]
    for acc in ROLE_ACCOUNTS.values():
        if acc.get("email", "").lower() == key:
            return acc
    if db is None:
        return None
    db_user = db.query(User).filter(User.email == key).first()
    if db_user:
        return _account_from_db_user(db_user)
    candidates = (
        db.query(User)
        .filter((User.id == key) | (User.id.like(f"usr-{key}-%")))
        .all()
    )
    for row in candidates:
        if row.id.lower() == key or _extract_username(row) == key:
            return _account_from_db_user(row)
    return None


def _build_auth_response(target_user: Dict[str, Any], message: str = "Login successful.") -> Dict[str, Any]:
    token = create_access_token(
        username=target_user["username"],
        role=target_user["role"],
        user_id=target_user["id"],
    )
    return {
        "success": True,
        "token": token,
        "id": target_user["id"],
        "username": target_user["username"],
        "email": target_user["email"],
        "fullName": target_user["fullName"],
        "role": target_user["role"],
        "organization": target_user.get("organization", "MOIL Limited"),
        "message": message,
    }


def check_rate_limit(identifier: str) -> None:
    now = time.time()
    attempts = FAILED_ATTEMPTS.get(identifier, [])
    recent_attempts = [t for t in attempts if now - t < LOCKOUT_DURATION_SEC]
    FAILED_ATTEMPTS[identifier] = recent_attempts
    if len(recent_attempts) >= LOCKOUT_THRESHOLD:
        remaining = int(LOCKOUT_DURATION_SEC - (now - recent_attempts[0]))
        raise HTTPException(
            status_code=429,
            detail=f"Security Lockout: 5 consecutive failed attempts detected. Account temporarily locked for {max(1, remaining // 60)} minutes.",
        )


def record_failed_attempt(identifier: str) -> None:
    now = time.time()
    FAILED_ATTEMPTS.setdefault(identifier, []).append(now)


def reset_failed_attempts(identifier: str) -> None:
    FAILED_ATTEMPTS.pop(identifier, None)


def get_current_user_payload(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Dependency enforcing a valid, non-revoked, unexpired Bearer JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
    token = authorization.replace("Bearer ", "", 1).strip()
    payload = decode_access_token(token)
    username = payload["sub"]
    user_acc = _find_account(username, db)
    if not user_acc:
        raise HTTPException(status_code=401, detail="User account no longer exists.")
    return user_acc


def require_roles(allowed_roles: List[str]):
    """Dependency factory enforcing RBAC clearance on protected endpoints."""
    def _checker(user_acc: Dict[str, Any] = Depends(get_current_user_payload)) -> Dict[str, Any]:
        if user_acc["role"] not in allowed_roles and user_acc["role"] != "ROLE_ADMIN":
            raise HTTPException(status_code=403, detail="Insufficient role clearance for this operation.")
        return user_acc
    return _checker


@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    uname = req.username.strip().lower()
    email = req.email.strip().lower()

    if len(uname) < 3 or not re.match(r"^[a-z0-9_.\-]+$", uname):
        raise HTTPException(
            status_code=400,
            detail="Username must be at least 3 characters (alphanumeric, '.', '_', '-' only).",
        )
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="A valid official email is required.")
    _validate_password_strength(req.password)

    # Check duplicate username / email across active accounts and SQLite
    if uname in ROLE_ACCOUNTS:
        raise HTTPException(status_code=409, detail=f"Username '{uname}' is already registered in MANGANEX.")
    for _, acc in ROLE_ACCOUNTS.items():
        if acc.get("email", "").lower() == email:
            raise HTTPException(status_code=409, detail=f"Email '{email}' is already associated with an existing account.")

    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="User with this email or username already exists in database.")
    username_candidates = (
        db.query(User)
        .filter((User.id == uname) | (User.id.like(f"usr-{uname}-%")))
        .all()
    )
    if any(row.id.lower() == uname or _extract_username(row) == uname for row in username_candidates):
        raise HTTPException(status_code=409, detail="User with this email or username already exists in database.")

    # Prevent privilege escalation via self-registration
    requested_role = _normalize_role(req.role or "ROLE_GEOLOGIST", default="ROLE_VIEWER")
    if requested_role == "ROLE_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Self-registration as Administrator is prohibited. Contact an authorized system administrator.",
        )
    assigned_role = requested_role

    uid = f"usr-{uname}-{uuid.uuid4().hex[:6]}"
    p_hash = hash_pw(req.password)
    auto_verified = not settings.REQUIRE_EMAIL_VERIFICATION

    verification_token = f"verif-{secrets.token_urlsafe(24)}"
    VERIFICATION_TOKENS[verification_token] = {
        "username": uname,
        "email": email,
        "expires_at": time.time() + 86400,
    }

    ROLE_ACCOUNTS[uname] = {
        "id": uid,
        "username": uname,
        "email": email,
        "fullName": req.fullName.strip(),
        "role": assigned_role,
        "organization": (req.organization or "MOIL Limited").strip(),
        "password_hash": p_hash,
        "verified": auto_verified,
    }

    try:
        new_db_user = User(
            id=uid,
            name=req.fullName.strip(),
            email=email,
            password_hash=p_hash,
            role=assigned_role,
            organization=(req.organization or "MOIL Limited").strip(),
        )
        db.add(new_db_user)
        db.commit()
    except Exception:
        db.rollback()

    message = (
        f"Account for {req.fullName.strip()} registered and activated. You may sign in immediately."
        if auto_verified
        else f"Account for {req.fullName.strip()} registered. Check your email to verify activation."
    )
    response: Dict[str, Any] = {
        "success": True,
        "message": message,
        "username": uname,
        "role": assigned_role,
        "email": email,
        "emailVerified": auto_verified,
    }
    if settings.allow_demo_tokens_in_response:
        response["verificationToken"] = verification_token
    return response


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
        "message": f"Email {info['email']} successfully verified. You may now sign in.",
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    u_key = req.username.lower().strip()
    check_rate_limit(u_key)

    target_user = _find_account(u_key, db)

    if not target_user or not verify_pw(req.password, target_user.get("password_hash", "")):
        record_failed_attempt(u_key)
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    if settings.REQUIRE_EMAIL_VERIFICATION and not target_user.get("verified", True):
        raise HTTPException(status_code=403, detail="Account email is not verified yet.")

    reset_failed_attempts(u_key)

    if req.role and req.role.strip():
        req_r = req.role.strip().upper()
        user_r = target_user["role"].upper()
        target_norm = _normalize_role(req_r, default=req_r)
        if target_norm != user_r and req_r not in user_r and user_r.replace("ROLE_", "") not in req_r:
            raise HTTPException(
                status_code=403,
                detail="Access denied: Account lacks required role clearance for this mission portal.",
            )

    return _build_auth_response(target_user, message="Login successful.")


@router.post("/demo-login")
def demo_login(req: DemoLoginRequest):
    if not settings.allow_demo_login:
        raise HTTPException(
            status_code=403,
            detail="Demo account quick sign-in is disabled in this environment.",
        )
    normalized_role = _normalize_role(req.role, default="")
    account_key = DEMO_ROLE_KEYS.get(normalized_role)
    target_user = ROLE_ACCOUNTS.get(account_key or "")
    if not target_user:
        raise HTTPException(status_code=400, detail="Unsupported demo profile requested.")
    return _build_auth_response(
        target_user,
        message=f"Demo access verified for {target_user['fullName']} ({target_user['role']}).",
    )


@router.get("/me")
def get_current_user(user_acc: Dict[str, Any] = Depends(get_current_user_payload)):
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
        "permissions": permissions,
    }


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "", 1).strip()
        if token:
            REVOKED_TOKENS.add(token)
    return {
        "success": True,
        "message": "Successfully logged out. Session revoked.",
    }


@router.post("/refresh")
def refresh_token(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No active token to refresh.")

    old_token = authorization.replace("Bearer ", "", 1).strip()
    payload = decode_access_token(old_token)
    username = payload["sub"]
    user_acc = _find_account(username, db)
    if not user_acc:
        raise HTTPException(status_code=401, detail="User account no longer exists.")

    REVOKED_TOKENS.add(old_token)
    new_token = create_access_token(
        username=user_acc["username"],
        role=user_acc["role"],
        user_id=user_acc["id"],
    )

    return {
        "success": True,
        "token": new_token,
        "username": user_acc["username"],
        "fullName": user_acc["fullName"],
        "role": user_acc["role"],
        "message": "Token refreshed successfully.",
    }


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    if not email_clean or not EMAIL_REGEX.match(email_clean):
        raise HTTPException(status_code=400, detail="Valid official email is required.")

    check_rate_limit(f"pwd_reset:{email_clean}")
    record_failed_attempt(f"pwd_reset:{email_clean}")

    # Constant generic message to prevent user enumeration
    generic_msg = "If an account exists for this email, password recovery instructions have been dispatched."
    target_user = _find_account(email_clean, db)
    if not target_user:
        return {"success": True, "message": generic_msg}

    reset_tok = f"rst-{secrets.token_urlsafe(24)}"
    RESET_TOKENS[reset_tok] = {
        "email": email_clean,
        "expires_at": time.time() + 1800,  # 30 minutes
    }

    if settings.allow_demo_tokens_in_response:
        return {
            "success": True,
            "message": f"Development mode reset token issued for {email_clean}.",
            "resetToken": reset_tok,
        }

    return {"success": True, "message": generic_msg}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if not req.token or req.token not in RESET_TOKENS:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    info = RESET_TOKENS[req.token]
    if time.time() > info["expires_at"]:
        del RESET_TOKENS[req.token]
        raise HTTPException(status_code=400, detail="Reset token has expired.")

    _validate_password_strength(req.new_password)

    email = info["email"]
    del RESET_TOKENS[req.token]
    reset_failed_attempts(f"pwd_reset:{email}")

    new_hash = hash_pw(req.new_password)
    target_acc = _find_account(email, db)
    if target_acc:
        target_acc["password_hash"] = new_hash
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        try:
            db_user.password_hash = new_hash
            db.commit()
        except Exception:
            db.rollback()
    if target_acc or db_user:
        return {
            "success": True,
            "message": "Password successfully updated. You may now sign in with your new password.",
        }

    return {
        "success": True,
        "message": "Password updated.",
    }
