import pytest
from app.services.risk_calculator import calculate_vulnerability_risk

def test_risk_calculation_standard():
    risk, breakdown = calculate_vulnerability_risk(
        cvss_score=8.0,
        epss_score=0.5,
        cisa_kev=False,
        asset_criticality="High",
        estimated_hours=2.0
    )
    # base_severity = 80.0
    # epss_mult = 1.0 + (0.5 * 1.5) = 1.75
    # kev_mult = 1.0
    # exploit_factor = 1.75
    # asset_criticality_factor = 1.8 (High)
    # expected_risk = 80.0 * 1.75 * 1.8 = 252.0
    assert breakdown.base_severity_score == 80.0
    assert breakdown.epss_multiplier == 1.75
    assert breakdown.cisa_kev_multiplier == 1.0
    assert breakdown.asset_criticality_multiplier == 1.8
    assert risk == 252.0
    assert breakdown.risk_density == 126.0

def test_risk_calculation_cisa_kev_multiplier():
    risk_no_kev, _ = calculate_vulnerability_risk(
        cvss_score=9.0,
        epss_score=0.4,
        cisa_kev=False,
        asset_criticality="Critical",
        estimated_hours=1.0
    )
    risk_with_kev, breakdown_kev = calculate_vulnerability_risk(
        cvss_score=9.0,
        epss_score=0.4,
        cisa_kev=True,
        asset_criticality="Critical",
        estimated_hours=1.0
    )
    assert breakdown_kev.cisa_kev_multiplier == 2.0
    assert risk_with_kev == pytest.approx(risk_no_kev * 2.0)

def test_risk_calculation_criticality_tiers():
    _, crit = calculate_vulnerability_risk(5.0, 0.1, False, "Critical", 1.0)
    _, high = calculate_vulnerability_risk(5.0, 0.1, False, "High", 1.0)
    _, med = calculate_vulnerability_risk(5.0, 0.1, False, "Medium", 1.0)
    _, low = calculate_vulnerability_risk(5.0, 0.1, False, "Low", 1.0)
    
    assert crit.total_risk_score > high.total_risk_score
    assert high.total_risk_score > med.total_risk_score
    assert med.total_risk_score > low.total_risk_score
