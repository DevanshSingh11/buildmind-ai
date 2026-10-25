"""Comprehensive end-to-end test suite for Construction Intelligence Platform."""

import io
import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("Running Construction Intelligence Platform Tests")
    print("==================================================")

    # 1. Health check
    r = client.get("/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print(f"[PASS] [1/9] GET /health -> {r.status_code} ({r.json()['status']})")

    # 2. Weather Advisory
    r = client.post("/api/weather/advisory", json={
        "location": "Austin, TX",
        "planned_activities": ["Concrete Pouring", "Tower Crane Lifting"]
    })
    assert r.status_code == 200, f"Weather advisory failed: {r.text}"
    data = r.json()
    assert "overall_construction_risk" in data
    print(f"[PASS] [2/9] POST /api/weather/advisory -> {r.status_code} (Risk: {data['overall_construction_risk']})")

    # 3. Knowledge Assistant
    r = client.post("/api/knowledge/query", json={
        "question": "What are minimum formwork stripping times under ACI 347R?",
        "category": "Concrete & Foundation"
    })
    assert r.status_code == 200, f"Knowledge query failed: {r.text}"
    data = r.json()
    assert "direct_answer" in data
    print(f"[PASS] [3/9] POST /api/knowledge/query -> {r.status_code} (Category: {data['category']})")

    # 4. Daily Assistant Chat
    r = client.post("/api/assistant/chat", json={
        "message": "Draft a 5-minute safety toolbox talk on working near crane radii",
        "history": []
    })
    assert r.status_code == 200, f"Assistant chat failed: {r.text}"
    data = r.json()
    assert "response" in data
    print(f"[PASS] [4/9] POST /api/assistant/chat -> {r.status_code} (Response length: {len(data['response'])} chars)")

    # 5. Project Planning
    r = client.post("/api/planning/generate", json={
        "projectName": "Skyline High-Rise Center",
        "projectType": "Commercial High-Rise",
        "budget": "$28,500,000",
        "timelineMonths": 16,
        "location": "Austin Metro, TX"
    })
    assert r.status_code == 200, f"Planning failed: {r.text}"
    data = r.json()
    assert "phases" in data
    print(f"[PASS] [5/9] POST /api/planning/generate -> {r.status_code} (Phases: {len(data['phases'])}, Milestones: {len(data['milestones'])})")

    # 6. Real Estate Valuation
    r = client.post("/api/valuation/estimate", json={
        "propertyType": "Commercial Mixed-Use",
        "areaSqFt": 45000,
        "location": "Austin Downtown, TX"
    })
    assert r.status_code == 200, f"Valuation failed: {r.text}"
    data = r.json()
    assert "estimated_value_mid" in data
    print(f"[PASS] [6/9] POST /api/valuation/estimate -> {r.status_code} (Value: ${int(data['estimated_value_mid']):,})")

    # 7. Safety Monitoring (Multimodal Image)
    mock_image = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00")
    r = client.post(
        "/api/safety/analyze",
        files={"file": ("site_photo.jpg", mock_image, "image/jpeg")},
        data={"zone": "Superstructure Zone B", "inspection_type": "OSHA PPE Compliance Audit"}
    )
    assert r.status_code == 200, f"Safety analysis failed: {r.text}"
    data = r.json()
    assert "risk_level" in data
    print(f"[PASS] [7/9] POST /api/safety/analyze -> {r.status_code} (Risk: {data['risk_level']}, Compliance: {data['compliance_score']}%)")

    # 8. Crack Detection (Multimodal Image)
    mock_image2 = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00")
    r = client.post(
        "/api/crack/analyze",
        files={"image": ("crack_fissure.jpg", mock_image2, "image/jpeg")},
        data={"surface_type": "Reinforced Concrete Beam", "location": "Transfer Girder Node"}
    )
    assert r.status_code == 200, f"Crack analysis failed: {r.text}"
    data = r.json()
    assert "severity" in data
    print(f"[PASS] [8/9] POST /api/crack/analyze -> {r.status_code} (Severity: {data['severity']}, Type: {data['crack_type']})")

    # 9. Projects CRUD
    r = client.post("/api/projects", json={
        "name": "Integration Test Project",
        "location": "Test Location",
        "project_type": "Residential",
        "status": "Planning",
        "budget": 500000,
        "progress": 10,
        "start_date": "2026-01-01",
        "target_date": "2026-12-31",
        "notes": "Testing projects endpoint."
    })
    assert r.status_code == 201, f"Projects create failed: {r.text}"
    print(f"[PASS] [9/9] POST /api/projects -> {r.status_code} (ID: {r.json()['id']})")

if __name__ == "__main__":
    run_tests()
