from typing import Dict, Any, Tuple
from app.schemas import RiskBreakdown

CRITICALITY_MULTIPLIERS = {
    'Critical': 2.5,
    'High': 1.8,
    'Medium': 1.2,
    'Low': 1.0
}

CISA_KEV_MULTIPLIER = 2.0

def calculate_vulnerability_risk(
    cvss_score: float,
    epss_score: float,
    cisa_kev: bool,
    asset_criticality: str,
    estimated_hours: float
) -> Tuple[float, RiskBreakdown]:
    base_severity = round(cvss_score * 10.0, 2)
    epss_mult = round(1.0 + (epss_score * 1.5), 3)
    kev_mult = CISA_KEV_MULTIPLIER if cisa_kev else 1.0
    exploit_factor = round(epss_mult * kev_mult, 3)
    
    crit_normalized = str(asset_criticality).capitalize()
    crit_mult = CRITICALITY_MULTIPLIERS.get(crit_normalized, 1.2)
    
    raw_risk = base_severity * exploit_factor * crit_mult
    total_risk = round(raw_risk, 2)
    
    hours = max(0.1, estimated_hours)
    risk_density = round(total_risk / hours, 2)
    
    cisa_str = f' x {kev_mult}x (CISA KEV active)' if cisa_kev else ''
    explanation = (
        f'Base Severity ({base_severity}) x Exploit Factor [{epss_mult} (EPSS {epss_score:.2f}){cisa_str}] '
        f'x Asset Criticality [{crit_mult}x ({crit_normalized})] = {total_risk} risk points. '
        f'Efficiency: {risk_density} risk/hr.'
    )
    
    breakdown = RiskBreakdown(
        cvss_score=cvss_score,
        base_severity_score=base_severity,
        epss_score=epss_score,
        epss_multiplier=epss_mult,
        cisa_kev=bool(cisa_kev),
        cisa_kev_multiplier=kev_mult,
        asset_criticality=crit_normalized,
        asset_criticality_multiplier=crit_mult,
        total_risk_score=total_risk,
        risk_density=risk_density,
        explanation=explanation
    )
    
    return total_risk, breakdown
