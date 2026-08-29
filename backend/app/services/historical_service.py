from typing import Dict, List, Optional
from app.database import execute_query, execute_write

def get_remediation_adjustment_factors() -> Dict[str, float]:
    rows = execute_query("""
        SELECT remediation_type, 
               AVG(actual_hours / CASE WHEN estimated_hours <= 0 THEN 1.0 ELSE estimated_hours END) as avg_factor 
        FROM historical_adjustments 
        WHERE estimated_hours > 0 AND actual_hours > 0 
        GROUP BY remediation_type
    """)
    factors = {}
    for r in rows:
        factors[r['remediation_type']] = round(float(r['avg_factor']), 2)
    return factors

def record_task_completion(
    remediation_type: str, 
    estimated_hours: float, 
    actual_hours: float,
    vulnerability_id: Optional[str] = None
):
    if estimated_hours > 0 and actual_hours > 0:
        variance = round(actual_hours / estimated_hours, 3)
        execute_write("""
            INSERT INTO historical_adjustments (
                vulnerability_id, remediation_type, estimated_hours, actual_hours, variance_ratio
            ) VALUES (?, ?, ?, ?, ?)
        """, (vulnerability_id, remediation_type, estimated_hours, actual_hours, variance))

def get_feedback_counts() -> Dict[str, int]:
    """Get mapping of vulnerability_id -> number of feedback entries."""
    rows = execute_query("""
        SELECT vulnerability_id, COUNT(*) as cnt 
        FROM historical_adjustments 
        WHERE vulnerability_id IS NOT NULL AND vulnerability_id != '' 
        GROUP BY vulnerability_id
    """)
    return {r["vulnerability_id"]: int(r["cnt"]) for r in rows}

def get_feedback_count_for_vuln(vulnerability_id: str) -> int:
    """Get feedback count for a specific vulnerability."""
    rows = execute_query(
        "SELECT COUNT(*) as cnt FROM historical_adjustments WHERE vulnerability_id = ?",
        (vulnerability_id,)
    )
    return int(rows[0]["cnt"]) if rows else 0

def undo_latest_feedback(vulnerability_id: str) -> bool:
    """Delete the most recent feedback entry for a specific vulnerability."""
    rows = execute_query(
        "SELECT id FROM historical_adjustments WHERE vulnerability_id = ? ORDER BY id DESC LIMIT 1",
        (vulnerability_id,)
    )
    if not rows:
        return False
    target_id = rows[0]["id"]
    execute_write("DELETE FROM historical_adjustments WHERE id = ?", (target_id,))
    return True

def clear_all_feedback_for_vuln(vulnerability_id: str) -> int:
    """Delete all feedback entries for a specific vulnerability without deleting the vulnerability itself."""
    count_before = get_feedback_count_for_vuln(vulnerability_id)
    if count_before > 0:
        execute_write("DELETE FROM historical_adjustments WHERE vulnerability_id = ?", (vulnerability_id,))
    return count_before
