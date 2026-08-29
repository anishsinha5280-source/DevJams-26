from typing import Dict, List
from app.database import execute_query, execute_write

def get_remediation_adjustment_factors() -> Dict[str, float]:
    rows = execute_query('SELECT remediation_type, AVG(actual_hours / CASE WHEN estimated_hours <= 0 THEN 1.0 ELSE estimated_hours END) as avg_factor FROM historical_adjustments WHERE estimated_hours > 0 AND actual_hours > 0 GROUP BY remediation_type')
    factors = {}
    for r in rows:
        factors[r['remediation_type']] = round(float(r['avg_factor']), 2)
    return factors

def record_task_completion(remediation_type: str, estimated_hours: float, actual_hours: float):
    if estimated_hours > 0 and actual_hours > 0:
        variance = round(actual_hours / estimated_hours, 3)
        execute_write('INSERT INTO historical_adjustments (remediation_type, estimated_hours, actual_hours, variance_ratio) VALUES (?, ?, ?, ?)', (remediation_type, estimated_hours, actual_hours, variance))
