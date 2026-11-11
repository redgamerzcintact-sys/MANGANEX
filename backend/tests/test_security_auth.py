"""Security and RBAC regression tests for MANGANEX FastAPI backend."""

import os
import secrets
import sys
import pytest
from fastapi.testclient import TestClient

TEST_ADMIN_PW = "Adm#" + secrets.token_hex(8)
TEST_VIEWER_PW = "Viw#" + secrets.token_hex(8)
os.environ.setdefault("MANGANEX_DEMO_ADMIN_PASSWORD", TEST_ADMIN_PW)
os.environ.setdefault("MANGANEX_DEMO_VIEWER_PASSWORD", TEST_VIEWER_PW)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.v1.endpoints.auth import ROLE_ACCOUNTS, hash_pw  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def _configure_ephemeral_test_passwords():
    prev_admin = ROLE_ACCOUNTS["admin"]["password_hash"]
    prev_viewer = ROLE_ACCOUNTS["viewer"]["password_hash"]
    ROLE_ACCOUNTS["admin"]["password_hash"] = hash_pw(TEST_ADMIN_PW)
    ROLE_ACCOUNTS["viewer"]["password_hash"] = hash_pw(TEST_VIEWER_PW)
    try:
        yield
    finally:
        ROLE_ACCOUNTS["admin"]["password_hash"] = prev_admin
        ROLE_ACCOUNTS["viewer"]["password_hash"] = prev_viewer


def _login(username: str, password: str) -> str:
    res = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["success"] is True
    token = body["token"]
    assert len(token.split(".")) == 3
    return token


def test_unauthenticated_auth_endpoints_rejected():
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.post("/api/v1/auth/refresh").status_code == 401


def test_jwt_login_me_refresh_logout_flow():
    token = _login("admin", TEST_ADMIN_PW)

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["username"] == "admin"
    assert me.json()["role"] == "ROLE_ADMIN"

    # Tampered signature must be rejected
    tampered = token[:-4] + ("AAAA" if not token.endswith("AAAA") else "BBBB")
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered}"}).status_code == 401

    # Refresh issues a new token and revokes the old one
    refreshed = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {token}"})
    assert refreshed.status_code == 200
    new_token = refreshed.json()["token"]
    assert new_token != token
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401

    # Logout revokes the active token
    out = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {new_token}"})
    assert out.status_code == 200
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {new_token}"}).status_code == 401


def test_admin_self_registration_blocked():
    res = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Untrusted User",
            "email": "untrusted_sec_test@example.com",
            "username": "untrusted_sec_test",
            "password": "StrongPassword#2026",
            "organization": "External",
            "role": "ROLE_ADMIN",
        },
    )
    assert res.status_code == 403


def test_protected_write_endpoints_require_auth_and_rbac():
    assert (
        client.post(
            "/api/v1/ai/documents",
            json={"title": "Test Doc", "content": "Unauthenticated write attempt"},
        ).status_code
        == 401
    )
    assert (
        client.post(
            "/api/v1/datasets/upload",
            json={"filename": "test.csv", "dataset_type": "assay", "records": 1},
        ).status_code
        == 401
    )
    assert client.delete("/api/v1/ai/documents/nonexistent-id").status_code == 401

    viewer_token = _login("viewer", TEST_VIEWER_PW)
    assert (
        client.delete(
            "/api/v1/ai/documents/nonexistent-id",
            headers={"Authorization": f"Bearer {viewer_token}"},
        ).status_code
        == 403
    )


def test_security_headers_present():
    health = client.get("/health")
    assert health.status_code == 200
    assert health.headers.get("x-content-type-options") == "nosniff"
    assert health.headers.get("x-frame-options") == "DENY"
    assert health.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "permissions-policy" in health.headers

    auth_resp = client.get("/api/v1/auth/me")
    assert auth_resp.headers.get("cache-control") == "no-store"
