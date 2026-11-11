import urllib.request
import urllib.parse
import json
import sys
import time

def make_request(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {'Content-Type': 'application/json'}
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
            try:
                return resp.status, json.loads(content)
            except:
                return resp.status, content
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, err_body
    except Exception as e:
        return 0, str(e)

def run_tests():
    print("=" * 70)
    print("MANGANEX FINAL UPGRADE: FULL-STACK COMPREHENSIVE VERIFICATION")
    print("=" * 70)
    passes = 0
    total = 0

    # ── TEST 1: Service Health Checks
    print("\n[1] Checking Core Service Ports & Health Endpoints...", flush=True)
    endpoints = [
        ("Frontend (Vite)", "http://localhost:3000/"),
        ("Python AI (FastAPI)", "http://localhost:8000/api/v1/mines"),
        ("Java Backend (Spring Boot)", "http://localhost:8080/actuator/health")
    ]
    for label, url in endpoints:
        total += 1
        status, res = make_request(url)
        if status in [200, 304]:
            print(f"  [PASS] {label} at {url} responded with HTTP {status}", flush=True)
            passes += 1
        else:
            print(f"  [FAIL] {label} at {url} returned HTTP {status}: {res}", flush=True)

    # ── TEST 2: Seeded Demo Role Logins (Part 2)
    print("\n[2] Testing 5 Seeded Role-Based Demo Accounts (Part 2)...")
    roles = [
        ("admin@moil.gov.in", "ManganexAdmin2026!", "ADMIN", "ROLE_ADMIN"),
        ("geologist@moil.gov.in", "ManganexGeo2026!", "GEOLOGIST", "ROLE_GEOLOGIST"),
        ("engineer@moil.gov.in", "ManganexEng2026!", "MINING_ENGINEER", "ROLE_ENGINEER"),
        ("analyst@moil.gov.in", "ManganexData2026!", "DATA_ANALYST", "ROLE_ANALYST"),
        ("viewer@moil.gov.in", "ManganexViewer2026!", "VIEWER", "ROLE_VIEWER"),
    ]
    for u, p, r, expected_role in roles:
        total += 1
        status, body = make_request("http://localhost:8000/api/v1/auth/login", method="POST", data={"username": u, "password": p, "role": r})
        if status == 200 and body.get("success") and body.get("role") == expected_role:
            print(f"  [PASS] Login for {r}: Token received, Role={body.get('role')}, Clearance Verified")
            passes += 1
        else:
            print(f"  [FAIL] Login for {r} failed: {status} -> {body}")

    # ── TEST 3: User Registration, Duplicate Prevention & Email Verification (Part 2)
    print("\n[3] Testing Registration & Email Verification Workflow (Part 2)...")
    test_user = f"dr_sharma_{int(time.time())}"
    reg_payload = {
        "fullName": "Dr. Ramesh Sharma",
        "email": f"{test_user}@moil.gov.in",
        "username": test_user,
        "password": "StrongPassword2026!",
        "organization": "GSI Central Exploration",
        "role": "ROLE_GEOLOGIST"
    }
    
    total += 1
    st, reg_res = make_request("http://localhost:8000/api/v1/auth/register", method="POST", data=reg_payload)
    if st == 200 and reg_res.get("success") and "verificationToken" in reg_res:
        v_token = reg_res["verificationToken"]
        print(f"  [PASS] User Registered: {test_user}, Verification Token: {v_token}")
        passes += 1
    else:
        print(f"  [FAIL] Registration failed: {st} -> {reg_res}")
        v_token = None

    # Test Duplicate Registration Prevention
    total += 1
    st_dup, dup_res = make_request("http://localhost:8000/api/v1/auth/register", method="POST", data=reg_payload)
    if st_dup == 409:
        print(f"  [PASS] Duplicate Prevention: Correctly rejected duplicate user with HTTP 409 Conflict")
        passes += 1
    else:
        print(f"  [FAIL] Duplicate check failed: Expected 409, got {st_dup}")

    # Test Email Verification
    if v_token:
        total += 1
        st_v, v_res = make_request(f"http://localhost:8000/api/v1/auth/verify-email?token={v_token}")
        if st_v == 200 and v_res.get("success"):
            print(f"  [PASS] Email Verification: Account activated successfully")
            passes += 1
        else:
            print(f"  [FAIL] Email verification failed: {st_v} -> {v_res}")

        # Test Login with newly registered user
        total += 1
        st_new_login, new_login_res = make_request("http://localhost:8000/api/v1/auth/login", method="POST", data={"username": test_user, "password": "StrongPassword2026!"})
        if st_new_login == 200 and new_login_res.get("success"):
            print(f"  [PASS] New User Sign In: Verified user logged in successfully with token {new_login_res.get('token')[:25]}...")
            passes += 1
        else:
            print(f"  [FAIL] Login with new user failed: {st_new_login} -> {new_login_res}")

    # ── TEST 4: Forgot Password & Reset Workflow
    print("\n[4] Testing Password Reset Protocol (Part 2)...")
    total += 1
    st_fp, fp_res = make_request("http://localhost:8000/api/v1/auth/forgot-password", method="POST", data={"email": f"{test_user}@moil.gov.in"})
    if st_fp == 200 and "resetToken" in fp_res:
        rst_token = fp_res["resetToken"]
        print(f"  [PASS] Forgot Password: Token generated: {rst_token}")
        passes += 1
    else:
        print(f"  [FAIL] Forgot password failed: {st_fp} -> {fp_res}")
        rst_token = None

    if rst_token:
        total += 1
        st_rp, rp_res = make_request("http://localhost:8000/api/v1/auth/reset-password", method="POST", data={"token": rst_token, "new_password": "NewManganexPassword2026!"})
        if st_rp == 200 and rp_res.get("success"):
            print(f"  [PASS] Reset Password: Password successfully updated with valid token")
            passes += 1
        else:
            print(f"  [FAIL] Reset password failed: {st_rp} -> {rp_res}")

    # ── TEST 5: NEXUS AI Multilingual Intelligence (Part 1)
    print("\n[5] Testing NEXUS AI Multilingual Dialogue & Tool Calling (Part 1)...")
    lang_queries = [
        ("en", "What is MANGANEX and how does it combine satellite and 3D subsurface models?", "MANGANEX"),
        ("hi", "मैंगनेक्स क्या है और संभावना विश्लेषण कैसे काम करता है?", "मैंगनेक्स"),
        ("mr", "लिथॉलॉजी आणि मिनरलायझेशन मधील काय फरक आहे?", "लिथॉलॉजी"),
        ("bn", "MANGANEX প্ল্যাটফর্ম সম্পর্কে বলুন", "MANGANEX"),
        ("ta", "MANGANEX புவியியல் தளம் என்றால் என்ன?", "MANGANEX"),
        ("te", "MANGANEX ప్లాట్‌ఫారమ్ గురించి వివరించండి", "MANGANEX"),
        ("es", "¿Qué es MANGANEX y cómo funciona la prospección?", "MANGANEX"),
        ("de", "Was ist MANGANEX und Sauser Belt Geologie?", "MANGANEX"),
        ("ja", "MANGANEXプラットフォームとは何ですか？", "MANGANEX")
    ]
    for lang, q, expected_substring in lang_queries:
        total += 1
        payload = {"query": q, "language": lang, "mine_id": "mine-balaghat", "conversation_id": "sess-test"}
        st_nx, nx_res = make_request("http://localhost:8000/api/v1/nexus/chat", method="POST", data=payload)
        data = nx_res.get("data", {}) if isinstance(nx_res, dict) else {}
        ans = data.get("answer", "")
        tools = data.get("tools_called", [])
        if st_nx == 200 and ans and expected_substring.lower() in ans.lower():
            print(f"  [PASS] NEXUS [{lang.upper()}]: Responded with verified context. Tools executed: {tools}")
            passes += 1
        else:
            print(f"  [FAIL] NEXUS [{lang.upper()}] failed: HTTP {st_nx}, answer preview: {ans[:60]}")

    # ── TEST 6: NEXUS AI Conversation Session Management (Part 1)
    print("\n[6] Testing Conversation Sessions CRUD (Part 1)...")
    total += 1
    st_slist, slist_res = make_request("http://localhost:8000/api/v1/nexus/sessions")
    if st_slist == 200 and len(slist_res.get("sessions", [])) >= 1:
        print(f"  [PASS] List Sessions: Retrieved {len(slist_res.get('sessions'))} persistent conversation sessions")
        passes += 1
    else:
        print(f"  [FAIL] List sessions failed: {st_slist}")

    # ── TEST 7: Subsurface 3D & Geological APIs (Part 3)
    print("\n[7] Testing Subsurface 3D Geological Data APIs (Part 3)...")
    geo_endpoints = [
        ("Boreholes Data", "http://localhost:8000/api/v1/geology/boreholes"),
        ("Prospects Data", "http://localhost:8000/api/v1/geology/prospects"),
        ("Mines Cadastre", "http://localhost:8000/api/v1/mines")
    ]
    for label, url in geo_endpoints:
        total += 1
        st_g, res_g = make_request(url)
        items = res_g if isinstance(res_g, list) else (res_g.get("data", []) if isinstance(res_g, dict) else [])
        if st_g == 200 and len(items) > 0:
            print(f"  [PASS] {label}: Returned {len(items)} verified data records")
            passes += 1
        else:
            print(f"  [FAIL] {label} at {url} returned: {st_g}")

    print("\n" + "=" * 70)
    print(f"FINAL UPGRADE AUDIT SCORE: {passes} / {total} TESTS PASSED ({(passes/total)*100:.1f}%)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
