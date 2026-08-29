from fastapi import APIRouter, HTTPException, UploadFile, File, Response, Query
from typing import List, Optional, Dict, Any
from app.database import execute_query, execute_write, execute_many
from app.schemas import (
    VulnerabilityResponse, VulnerabilityCreate, VulnerabilityUpdate,
    CSVImportSummary
)
from app.services.risk_calculator import calculate_vulnerability_risk
from app.services.csv_handler import parse_and_validate_csv, SAMPLE_CSV_TEMPLATE
from app.services.historical_service import record_task_completion

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerabilities"])

def enrich_vulnerability_record(row: Dict[str, Any]) -> VulnerabilityResponse:
    risk_val, breakdown = calculate_vulnerability_risk(
        cvss_score=row["cvss_score"],
        epss_score=row["epss_score"],
        cisa_kev=bool(row["cisa_kev"]),
        asset_criticality=row["asset_criticality"],
        estimated_hours=row["estimated_hours"]
    )
    return VulnerabilityResponse(
        vulnerability_id=row["vulnerability_id"],
        title=row["title"],
        severity=row["severity"],
        cvss_score=row["cvss_score"],
        epss_score=row["epss_score"],
        cisa_kev=bool(row["cisa_kev"]),
        asset_name=row["asset_name"],
        asset_criticality=row["asset_criticality"],
        remediation_type=row["remediation_type"],
        estimated_hours=row["estimated_hours"],
        actual_hours=row.get("actual_hours", 0.0) or 0.0,
        status=row["status"],
        description=row.get("description", "") or "",
        remediation_steps=row.get("remediation_steps", "") or "",
        created_at=str(row.get("created_at", "")),
        calculated_risk=risk_val,
        risk_breakdown=breakdown
    )

@router.get("", response_model=List[VulnerabilityResponse])
def get_vulnerabilities(
    status: Optional[str] = Query(None, description="Filter by status: pending or completed"),
    severity: Optional[str] = Query(None, description="Filter by severity: Critical, High, Medium, Low"),
    search: Optional[str] = Query(None, description="Search keyword in title, asset_name, or ID")
):
    query = "SELECT * FROM vulnerabilities WHERE 1=1"
    params = []
    
    if status:
        query += " AND LOWER(status) = ?"
        params.append(status.lower())
    if severity:
        query += " AND LOWER(severity) = ?"
        params.append(severity.lower())
    if search:
        query += " AND (LOWER(title) LIKE ? OR LOWER(asset_name) LIKE ? OR LOWER(vulnerability_id) LIKE ?)"
        term = f"%{search.lower()}%"
        params.extend([term, term, term])
        
    query += " ORDER BY cvss_score DESC, created_at DESC"
    rows = execute_query(query, tuple(params))
    return [enrich_vulnerability_record(r) for r in rows]

@router.get("/metrics/summary")
def get_metrics_summary():
    rows = execute_query("SELECT * FROM vulnerabilities")
    total_count = len(rows)
    pending_rows = [r for r in rows if r["status"] == "pending"]
    completed_rows = [r for r in rows if r["status"] == "completed"]
    
    enriched_pending = [enrich_vulnerability_record(r) for r in pending_rows]
    
    total_pending_risk = round(sum(item.calculated_risk for item in enriched_pending), 2)
    total_pending_hours = round(sum(item.estimated_hours for item in enriched_pending), 2)
    
    severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for r in pending_rows:
        sev = r["severity"].capitalize()
        if sev in severity_counts:
            severity_counts[sev] += 1
            
    cisa_count = sum(1 for r in pending_rows if r["cisa_kev"])
    
    return {
        "total_vulnerabilities": total_count,
        "pending_count": len(pending_rows),
        "completed_count": len(completed_rows),
        "total_pending_risk": total_pending_risk,
        "total_pending_hours": total_pending_hours,
        "critical_count": severity_counts["Critical"],
        "high_count": severity_counts["High"],
        "medium_count": severity_counts["Medium"],
        "low_count": severity_counts["Low"],
        "cisa_kev_active_count": cisa_count
    }

@router.get("/template.csv")
def download_csv_template():
    return Response(
        content=SAMPLE_CSV_TEMPLATE,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vulnerabilities_template.csv"}
    )

@router.post("/upload-csv", response_model=CSVImportSummary)
async def upload_csv_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv file.")
        
    content = await file.read()
    try:
        csv_str = content.decode("utf-8")
    except UnicodeDecodeError:
        csv_str = content.decode("latin-1")
        
    records, errors = parse_and_validate_csv(csv_str)
    
    if not records and errors:
        return CSVImportSummary(total_rows=0, successfully_imported=0, errors=errors)
        
    inserted_count = 0
    for r in records:
        try:
            execute_write("""
                INSERT INTO vulnerabilities (
                    vulnerability_id, title, severity, cvss_score, epss_score, cisa_kev,
                    asset_name, asset_criticality, remediation_type, estimated_hours,
                    actual_hours, status, description, remediation_steps
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(vulnerability_id) DO UPDATE SET
                    title=excluded.title,
                    severity=excluded.severity,
                    cvss_score=excluded.cvss_score,
                    epss_score=excluded.epss_score,
                    cisa_kev=excluded.cisa_kev,
                    asset_name=excluded.asset_name,
                    asset_criticality=excluded.asset_criticality,
                    remediation_type=excluded.remediation_type,
                    estimated_hours=excluded.estimated_hours,
                    description=excluded.description,
                    remediation_steps=excluded.remediation_steps
            """, (
                r["vulnerability_id"], r["title"], r["severity"], r["cvss_score"],
                r["epss_score"], r["cisa_kev"], r["asset_name"], r["asset_criticality"],
                r["remediation_type"], r["estimated_hours"], r["actual_hours"],
                r["status"], r["description"], r["remediation_steps"]
            ))
            inserted_count += 1
        except Exception as ex:
            errors.append(f"DB insert error for {r['vulnerability_id']}: {str(ex)}")
            
    return CSVImportSummary(
        total_rows=len(records) + len([e for e in errors if "Row" in e]),
        successfully_imported=inserted_count,
        errors=errors
    )

@router.post("", response_model=VulnerabilityResponse)
def create_vulnerability(vuln: VulnerabilityCreate):
    existing = execute_query("SELECT vulnerability_id FROM vulnerabilities WHERE vulnerability_id = ?", (vuln.vulnerability_id,))
    if existing:
        raise HTTPException(status_code=400, detail=f"Vulnerability ID '{vuln.vulnerability_id}' already exists.")
        
    execute_write("""
        INSERT INTO vulnerabilities (
            vulnerability_id, title, severity, cvss_score, epss_score, cisa_kev,
            asset_name, asset_criticality, remediation_type, estimated_hours,
            actual_hours, status, description, remediation_steps
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        vuln.vulnerability_id, vuln.title, vuln.severity, vuln.cvss_score,
        vuln.epss_score, 1 if vuln.cisa_kev else 0, vuln.asset_name,
        vuln.asset_criticality, vuln.remediation_type, vuln.estimated_hours,
        vuln.actual_hours or 0.0, vuln.status, vuln.description, vuln.remediation_steps
    ))
    
    rows = execute_query("SELECT * FROM vulnerabilities WHERE vulnerability_id = ?", (vuln.vulnerability_id,))
    return enrich_vulnerability_record(rows[0])

@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
def get_vulnerability_by_id(vuln_id: str):
    rows = execute_query("SELECT * FROM vulnerabilities WHERE vulnerability_id = ?", (vuln_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return enrich_vulnerability_record(rows[0])

@router.put("/{vuln_id}", response_model=VulnerabilityResponse)
def update_vulnerability(vuln_id: str, payload: VulnerabilityUpdate):
    rows = execute_query("SELECT * FROM vulnerabilities WHERE vulnerability_id = ?", (vuln_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
        
    current = dict(rows[0])
    updates = payload.model_dump(exclude_unset=True)
    
    # If marking completed and actual_hours provided, record to historical adjustments
    if "status" in updates and updates["status"] == "completed" and current["status"] != "completed":
        actual_h = updates.get("actual_hours", current.get("actual_hours") or current["estimated_hours"])
        record_task_completion(
            remediation_type=current["remediation_type"],
            estimated_hours=current["estimated_hours"],
            actual_hours=actual_h
        )
        
    for k, v in updates.items():
        if k == "cisa_kev":
            current[k] = 1 if v else 0
        else:
            current[k] = v
            
    execute_write("""
        UPDATE vulnerabilities SET
            title = ?, severity = ?, cvss_score = ?, epss_score = ?,
            cisa_kev = ?, asset_name = ?, asset_criticality = ?,
            remediation_type = ?, estimated_hours = ?, actual_hours = ?,
            status = ?, description = ?, remediation_steps = ?
        WHERE vulnerability_id = ?
    """, (
        current["title"], current["severity"], current["cvss_score"], current["epss_score"],
        current["cisa_kev"], current["asset_name"], current["asset_criticality"],
        current["remediation_type"], current["estimated_hours"], current["actual_hours"],
        current["status"], current["description"], current["remediation_steps"],
        vuln_id
    ))
    
    updated_rows = execute_query("SELECT * FROM vulnerabilities WHERE vulnerability_id = ?", (vuln_id,))
    return enrich_vulnerability_record(updated_rows[0])

@router.delete("/{vuln_id}")
def delete_vulnerability(vuln_id: str):
    rows = execute_query("SELECT vulnerability_id FROM vulnerabilities WHERE vulnerability_id = ?", (vuln_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    execute_write("DELETE FROM vulnerabilities WHERE vulnerability_id = ?", (vuln_id,))
    return {"message": f"Vulnerability '{vuln_id}' deleted successfully."}
