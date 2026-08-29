import pytest
from app.services.optimizer import run_01_knapsack, run_traditional_top_down
from app.services.explainability import compare_strategies

def test_knapsack_outperforms_traditional():
    # Scenario: 5.0h budget
    # Item A: 5.0h, Risk = 100 (Single big item, density = 20)
    # Item B: 2.0h, Risk = 70 (density = 35)
    # Item C: 2.0h, Risk = 60 (density = 30)
    # Item D: 1.0h, Risk = 40 (density = 40)
    # Traditional top-down picks Item A (5.0h, risk=100)
    # Knapsack picks B + C + D (5.0h, risk=170) -> 70% risk improvement!
    items = [
        {
            "vulnerability_id": "ITEM-A",
            "title": "Big Heavy Patch",
            "severity": "Critical",
            "cvss_score": 9.9,
            "epss_score": 0.5,
            "cisa_kev": False,
            "asset_name": "DB Server",
            "asset_criticality": "Critical",
            "remediation_type": "Patch",
            "estimated_hours": 5.0,
            "effective_hours": 5.0,
            "calculated_risk": 100.0,
            "risk_density": 20.0,
            "risk_breakdown": None
        },
        {
            "vulnerability_id": "ITEM-B",
            "title": "High Impact Quick Fix",
            "severity": "High",
            "cvss_score": 8.5,
            "epss_score": 0.8,
            "cisa_kev": True,
            "asset_name": "API Gateway",
            "asset_criticality": "High",
            "remediation_type": "Configuration",
            "estimated_hours": 2.0,
            "effective_hours": 2.0,
            "calculated_risk": 70.0,
            "risk_density": 35.0,
            "risk_breakdown": None
        },
        {
            "vulnerability_id": "ITEM-C",
            "title": "WAF Rule Deployment",
            "severity": "High",
            "cvss_score": 8.0,
            "epss_score": 0.7,
            "cisa_kev": True,
            "asset_name": "Web Proxy",
            "asset_criticality": "High",
            "remediation_type": "WAF Rule",
            "estimated_hours": 2.0,
            "effective_hours": 2.0,
            "calculated_risk": 60.0,
            "risk_density": 30.0,
            "risk_breakdown": None
        },
        {
            "vulnerability_id": "ITEM-D",
            "title": "SSH Config Hardening",
            "severity": "Medium",
            "cvss_score": 6.5,
            "epss_score": 0.4,
            "cisa_kev": False,
            "asset_name": "Bastion Node",
            "asset_criticality": "Medium",
            "remediation_type": "Configuration",
            "estimated_hours": 1.0,
            "effective_hours": 1.0,
            "calculated_risk": 40.0,
            "risk_density": 40.0,
            "risk_breakdown": None
        }
    ]
    
    knap_sel, knap_skip = run_01_knapsack(items, 5.0)
    trad_sel, trad_skip = run_traditional_top_down(items, 5.0)
    
    knap_risk = sum(i["calculated_risk"] for i in knap_sel)
    trad_risk = sum(i["calculated_risk"] for i in trad_sel)
    
    assert knap_risk == 170.0
    assert trad_risk == 100.0
    assert len(knap_sel) == 3
    assert len(trad_sel) == 1
    assert "ITEM-A" in [i["vulnerability_id"] for i in trad_sel]
    assert "ITEM-A" in [i["vulnerability_id"] for i in knap_skip]

def test_optimizer_edge_case_zero_hours():
    items = [
        {"vulnerability_id": "V1", "effective_hours": 1.0, "calculated_risk": 50.0, "risk_density": 50.0}
    ]
    knap_sel, knap_skip = run_01_knapsack(items, 0.0)
    assert len(knap_sel) == 0
    assert len(knap_skip) == 1

def test_optimizer_edge_case_empty_items():
    knap_sel, knap_skip = run_01_knapsack([], 10.0)
    assert len(knap_sel) == 0
    assert len(knap_skip) == 0

def test_optimizer_edge_case_all_fit():
    items = [
        {"vulnerability_id": "V1", "effective_hours": 1.0, "calculated_risk": 50.0, "risk_density": 50.0},
        {"vulnerability_id": "V2", "effective_hours": 2.0, "calculated_risk": 80.0, "risk_density": 40.0}
    ]
    knap_sel, knap_skip = run_01_knapsack(items, 10.0)
    assert len(knap_sel) == 2
    assert len(knap_skip) == 0

def test_optimizer_edge_case_none_fit():
    items = [
        {"vulnerability_id": "V1", "effective_hours": 6.0, "calculated_risk": 150.0, "risk_density": 25.0},
        {"vulnerability_id": "V2", "effective_hours": 8.0, "calculated_risk": 200.0, "risk_density": 25.0}
    ]
    knap_sel, knap_skip = run_01_knapsack(items, 4.0)
    assert len(knap_sel) == 0
    assert len(knap_skip) == 2
