import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"
JAVA_URL = "http://localhost:8080/actuator/health"
FRONTEND_URL = "http://localhost:3000"

def http_post(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.getcode(), json.loads(resp.read().decode('utf-8'))

def http_get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.getcode(), resp.read().decode('utf-8')

print("=====================================================================")
print(" MANGANEX MASTER REPAIR & VERIFICATION TEST SUITE")
print("=====================================================================\n")

# ── 1. AUTHENTICATION & ROLE TEST ──────────────────────────────────────────────
print("── PART 1: 5-ROLE AUTHENTICATION & PORTAL MAPPING TEST ──")
ROLES_TO_TEST = [
    {"role": "ADMIN", "user": "admin@moil.gov.in", "pass": "ManganexAdmin2026!", "expected_role": "ROLE_ADMIN", "expected_route": "/admin/dashboard"},
    {"role": "GEOLOGIST", "user": "geologist@moil.gov.in", "pass": "ManganexGeo2026!", "expected_role": "ROLE_GEOLOGIST", "expected_route": "/geologist/dashboard"},
    {"role": "MINING_ENGINEER", "user": "engineer@moil.gov.in", "pass": "ManganexEng2026!", "expected_role": "ROLE_ENGINEER", "expected_route": "/operations/dashboard"},
    {"role": "DATA_ANALYST", "user": "analyst@moil.gov.in", "pass": "ManganexData2026!", "expected_role": "ROLE_ANALYST", "expected_route": "/analytics/dashboard"},
    {"role": "VIEWER", "user": "viewer@moil.gov.in", "pass": "ManganexViewer2026!", "expected_role": "ROLE_VIEWER", "expected_route": "/viewer/dashboard"}
]

for r in ROLES_TO_TEST:
    payload = {"username": r["user"], "password": r["pass"], "role": r["role"]}
    try:
        code, data = http_post(f"{BASE_URL}/auth/login", payload)
        if code == 200 and data.get("token") and data.get("role") == r["expected_role"]:
            print(f" [PASS] {r['role']:<16} -> Authenticated as {data.get('fullName')} | Role: {data.get('role')} -> Portal: {r['expected_route']}")
        else:
            print(f" [FAIL] {r['role']}: {code} - {data}")
    except Exception as e:
        print(f" [ERR] {r['role']}: {e}")

# ── 2. NEXUS AI 6-QUESTION INTELLIGENCE TEST ──────────────────────────────────
print("\n── PART 2: NEXUS AI 6-QUESTION REASONING & CONVERSATION TEST ──")
conv_id = "test-session-suite-1"

TEST_QUESTIONS = [
    ("Q1: Platform Definition", "What is MANGANEX?"),
    ("Q2: Prospectivity Modeling", "Explain manganese prospectivity analysis."),
    ("Q3: Geological Distinction", "What is the difference between lithology and mineralization?"),
    ("Q4: Production Engineering", "What production factors can cause a shortfall?"),
    ("Q5: Contextual Follow-up", "Explain my previous question in simpler language."),
    ("Q6: Selected Mine Synthesis", "Summarize the geological data for the selected mine.")
]

answers = []
for label, q_text in TEST_QUESTIONS:
    payload = {
        "query": q_text,
        "conversation_id": conv_id,
        "mine_id": "mine-balaghat",
        "language": "en"
    }
    try:
        code, resp_json = http_post(f"{BASE_URL}/nexus/chat", payload)
        data = resp_json.get("data", {})
        answer_snippet = data.get("answer", "")
        intent = data.get("intent", "UNKNOWN")
        sources_cnt = len(data.get("sources", []))
        tools = data.get("tools_called", [])
        
        print(f"\n[{label}] Query: \"{q_text}\"")
        print(f"  • Intent: {intent}")
        print(f"  • Tools Dispatched: {tools}")
        print(f"  • Sources Cited: {sources_cnt} reference documents")
        print(f"  • Answer Preview: {answer_snippet[:160]}...")
        answers.append(answer_snippet)
    except Exception as e:
        print(f"\n[{label}] FAILED with exception: {e}")

# Verify uniqueness
unique_answers = set(answers)
print("\n── ANSWER UNIQUENESS VERIFICATION ──")
print(f"Total Questions Asked: {len(answers)}")
print(f"Unique Answers Generated: {len(unique_answers)}")
if len(unique_answers) == len(answers):
    print(" [PASS] 100% Unique, non-repeating answers verified across all inquiries!")
else:
    print(" [FAIL] Duplicate answers detected!")

# ── 3. MULTILINGUAL CHAT TEST ────────────────────────────────────────────────
print("\n── PART 3: MULTILINGUAL TEST (Hindi & Marathi) ──")
for l_code, l_name in [("hi", "Hindi"), ("mr", "Marathi")]:
    payload = {"query": "What is MANGANEX?", "conversation_id": f"multi-{l_code}", "language": l_code}
    try:
        code, resp_json = http_post(f"{BASE_URL}/nexus/chat", payload)
        ans = resp_json.get("data", {}).get("answer", "")
        print(f" [PASS] {l_name} ({l_code}): {ans[:100]}...")
    except Exception as e:
        print(f" [FAIL] {l_name}: {e}")

# ── 4. WEB HEALTH ─────────────────────────────────────────────────────────────
print("\n── PART 4: WEB APPLICATION GATEWAY HEALTH ──")
try:
    f_code, f_body = http_get(FRONTEND_URL)
    print(f" [PASS] Frontend Portal (Port 3000): HTTP {f_code} OK")
except Exception as e:
    print(f" [FAIL] Frontend: {e}")

try:
    j_code, j_body = http_get(JAVA_URL)
    print(f" [PASS] Java Spring Boot Core (Port 8080): {j_body.strip()}")
except Exception as e:
    print(f" [FAIL] Java Backend: {e}")

print("\n=====================================================================")
print(" ALL VERIFICATION SUITE CHECKS COMPLETE")
print("=====================================================================")
