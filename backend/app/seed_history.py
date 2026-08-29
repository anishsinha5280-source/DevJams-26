from typing import List, Dict, Any

DEMO_HISTORICAL_DATA: List[Dict[str, Any]] = [
    {"remediation_type": "Patch", "estimated_hours": 2.0, "actual_hours": 2.3, "variance_ratio": 1.15},
    {"remediation_type": "Patch", "estimated_hours": 4.0, "actual_hours": 4.8, "variance_ratio": 1.20},
    {"remediation_type": "Patch", "estimated_hours": 1.5, "actual_hours": 1.6, "variance_ratio": 1.07},
    {"remediation_type": "Configuration", "estimated_hours": 1.0, "actual_hours": 0.9, "variance_ratio": 0.90},
    {"remediation_type": "Configuration", "estimated_hours": 0.5, "actual_hours": 0.5, "variance_ratio": 1.00},
    {"remediation_type": "Isolation", "estimated_hours": 2.0, "actual_hours": 1.8, "variance_ratio": 0.90},
    {"remediation_type": "Isolation", "estimated_hours": 1.0, "actual_hours": 1.1, "variance_ratio": 1.10},
    {"remediation_type": "WAF Rule", "estimated_hours": 0.5, "actual_hours": 0.4, "variance_ratio": 0.80},
    {"remediation_type": "WAF Rule", "estimated_hours": 0.5, "actual_hours": 0.6, "variance_ratio": 1.20},
    {"remediation_type": "Credential Rotation", "estimated_hours": 1.0, "actual_hours": 1.2, "variance_ratio": 1.20}
]
