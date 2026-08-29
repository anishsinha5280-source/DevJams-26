import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Cybersecurity Risk Prioritization System" in data["app"]

def test_demo_load_and_get_vulnerabilities():
    load_res = client.post("/api/demo/load")
    assert load_res.status_code == 200
    assert load_res.json()["vulnerabilities_count"] == 20
    
    get_res = client.get("/api/vulnerabilities")
    assert get_res.status_code == 200
    vulns = get_res.json()
    assert len(vulns) == 20
    assert "calculated_risk" in vulns[0]
    assert "risk_breakdown" in vulns[0]

def test_run_optimization_endpoint():
    client.post("/api/demo/load")
    
    opt_res = client.post("/api/optimize", json={"available_hours": 5.0})
    assert opt_res.status_code == 200
    data = opt_res.json()
    
    assert data["available_hours"] == 5.0
    assert "knapsack_strategy" in data
    assert "traditional_strategy" in data
    assert "delta_risk_gain" in data
    assert data["knapsack_strategy"]["total_hours_used"] <= 5.0
    assert data["traditional_strategy"]["total_hours_used"] <= 5.0
    assert len(data["knapsack_strategy"]["selected_tasks"]) > 0

def test_vulnerability_crud_flow():
    new_vuln = {
        "vulnerability_id": "TEST-VULN-999",
        "title": "Custom Test SQL Injection",
        "severity": "Critical",
        "cvss_score": 9.4,
        "epss_score": 0.85,
        "cisa_kev": True,
        "asset_name": "Test Auth API",
        "asset_criticality": "Critical",
        "remediation_type": "Patch",
        "estimated_hours": 2.5,
        "description": "SQL injection in auth token endpoint."
    }
    
    # Create
    create_res = client.post("/api/vulnerabilities", json=new_vuln)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["vulnerability_id"] == "TEST-VULN-999"
    assert created["calculated_risk"] > 0
    
    # Update
    update_res = client.put("/api/vulnerabilities/TEST-VULN-999", json={"estimated_hours": 3.0, "status": "completed"})
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["estimated_hours"] == 3.0
    assert updated["status"] == "completed"
    
    # Delete
    del_res = client.delete("/api/vulnerabilities/TEST-VULN-999")
    assert del_res.status_code == 200
