from fastapi import APIRouter
from app.database import execute_write, execute_many
from app.seed_data import DEMO_VULNERABILITIES
from app.seed_history import DEMO_HISTORICAL_DATA

router = APIRouter(prefix="/demo", tags=["Demo & Seed Data"])

@router.post("/load")
def load_demo_dataset():
    """
    Clears current tables and instantly loads the 20 structured demo vulnerabilities and historical data.
    """
    execute_write("DELETE FROM vulnerabilities")
    execute_write("DELETE FROM historical_adjustments")
    
    # Insert vulnerabilities
    vuln_params = [
        (
            v["vulnerability_id"], v["title"], v["severity"], v["cvss_score"],
            v["epss_score"], v["cisa_kev"], v["asset_name"], v["asset_criticality"],
            v["remediation_type"], v["estimated_hours"], v["actual_hours"],
            v["status"], v["description"], v["remediation_steps"]
        )
        for v in DEMO_VULNERABILITIES
    ]
    execute_many("""
        INSERT INTO vulnerabilities (
            vulnerability_id, title, severity, cvss_score, epss_score, cisa_kev,
            asset_name, asset_criticality, remediation_type, estimated_hours,
            actual_hours, status, description, remediation_steps
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, vuln_params)
    
    # Insert historical adjustments with vulnerability_id
    hist_params = [
        (h.get("vulnerability_id", ""), h["remediation_type"], h["estimated_hours"], h["actual_hours"], h["variance_ratio"])
        for h in DEMO_HISTORICAL_DATA
    ]
    execute_many("""
        INSERT INTO historical_adjustments (vulnerability_id, remediation_type, estimated_hours, actual_hours, variance_ratio)
        VALUES (?, ?, ?, ?, ?)
    """, hist_params)
    
    return {
        "message": "Demo dataset loaded successfully.",
        "vulnerabilities_count": len(DEMO_VULNERABILITIES),
        "historical_records_count": len(DEMO_HISTORICAL_DATA)
    }

@router.post("/reset")
def reset_database():
    execute_write("DELETE FROM vulnerabilities")
    execute_write("DELETE FROM historical_adjustments")
    return {"message": "Database reset to empty state."}
