from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database import execute_query
from app.schemas import OptimizationRequest, OptimizationComparisonResponse
from app.services.risk_calculator import calculate_vulnerability_risk
from app.services.optimizer import run_01_knapsack, run_traditional_top_down
from app.services.explainability import compare_strategies
from app.services.historical_service import get_remediation_adjustment_factors

router = APIRouter(prefix="/optimize", tags=["Optimization Engine"])

@router.post("", response_model=OptimizationComparisonResponse)
def run_optimization(request: OptimizationRequest):
    if request.available_hours <= 0:
        raise HTTPException(status_code=400, detail="available_hours must be strictly greater than 0.")
        
    rows = execute_query("SELECT * FROM vulnerabilities WHERE status = 'pending'")
    if not rows:
        # Return clean empty comparison response
        return compare_strategies([], [], [], [], request.available_hours, [])
        
    # Get historical adjustment factors if requested
    adj_factors = get_remediation_adjustment_factors() if request.use_historical_adjustments else {}
    
    # Process items
    candidate_items = []
    for r in rows:
        vuln_id = r["vulnerability_id"]
        
        # Filter excluded or included
        if request.excluded_vulnerability_ids and vuln_id in request.excluded_vulnerability_ids:
            continue
        if request.included_only_vulnerability_ids and vuln_id not in request.included_only_vulnerability_ids:
            continue
            
        risk_val, breakdown = calculate_vulnerability_risk(
            cvss_score=r["cvss_score"],
            epss_score=r["epss_score"],
            cisa_kev=bool(r["cisa_kev"]),
            asset_criticality=r["asset_criticality"],
            estimated_hours=r["estimated_hours"]
        )
        
        # Effective hours with optional historical adjustment factor
        rem_type = r["remediation_type"]
        factor = adj_factors.get(rem_type, 1.0) if request.use_historical_adjustments else 1.0
        effective_h = round(r["estimated_hours"] * factor, 2)
        
        candidate_items.append({
            "vulnerability_id": vuln_id,
            "title": r["title"],
            "severity": r["severity"],
            "cvss_score": r["cvss_score"],
            "epss_score": r["epss_score"],
            "cisa_kev": bool(r["cisa_kev"]),
            "asset_name": r["asset_name"],
            "asset_criticality": r["asset_criticality"],
            "remediation_type": rem_type,
            "estimated_hours": r["estimated_hours"],
            "effective_hours": effective_h,
            "calculated_risk": risk_val,
            "risk_density": round(risk_val / max(0.1, effective_h), 2),
            "risk_breakdown": breakdown
        })
        
    # Run 0/1 Knapsack
    knapsack_selected, knapsack_skipped = run_01_knapsack(candidate_items, request.available_hours)
    
    # Run Traditional Top-Down Baseline
    trad_selected, trad_skipped = run_traditional_top_down(candidate_items, request.available_hours)
    
    # Build complete explainability & comparison response
    return compare_strategies(
        knapsack_selected=knapsack_selected,
        knapsack_skipped=knapsack_skipped,
        traditional_selected=trad_selected,
        traditional_skipped=trad_skipped,
        available_hours=request.available_hours,
        all_items=candidate_items
    )
