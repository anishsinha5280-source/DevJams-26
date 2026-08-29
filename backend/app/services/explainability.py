from typing import List, Dict, Any
from app.schemas import TaskSelectionDetail, SkippedTaskDetail, StrategyResult, OptimizationComparisonResponse

def build_strategy_result(
    strategy_name: str,
    strategy_description: str,
    selected_raw: List[Dict[str, Any]],
    skipped_raw: List[Dict[str, Any]],
    available_hours: float,
    total_backlog_risk: float,
    counterpart_selected: List[Dict[str, Any]] = None
) -> StrategyResult:
    selected_tasks = []
    cum_hours = 0.0
    cum_risk = 0.0
    
    for idx, item in enumerate(selected_raw, 1):
        cost = item['effective_hours']
        risk = item['calculated_risk']
        cum_hours += cost
        cum_risk += risk
        
        if 'Knapsack' in strategy_name:
            reason = (
                f"Optimally selected by 0/1 Knapsack DP. Delivers {item['risk_density']} risk reduction per hour, "
                f"yielding {risk} risk reduction in {cost}h."
            )
        else:
            reason = (
                f"Selected by Top-Down ranking (Rank #{idx} in risk magnitude). "
                f"Yields {risk} risk reduction in {cost}h."
            )
            
        task_detail = TaskSelectionDetail(
            vulnerability_id=item['vulnerability_id'],
            title=item['title'],
            severity=item['severity'],
            cvss_score=item['cvss_score'],
            epss_score=item['epss_score'],
            cisa_kev=bool(item['cisa_kev']),
            asset_name=item['asset_name'],
            asset_criticality=item['asset_criticality'],
            remediation_type=item['remediation_type'],
            estimated_hours=cost,
            calculated_risk=risk,
            risk_density=item['risk_density'],
            risk_breakdown=item['risk_breakdown'],
            selection_order=idx,
            cumulative_hours=round(cum_hours, 2),
            cumulative_risk=round(cum_risk, 2),
            selection_reason=reason
        )
        selected_tasks.append(task_detail)
        
    total_risk_reduced = round(cum_risk, 2)
    total_hours_used = round(cum_hours, 2)
    remaining_hours = max(0.0, round(available_hours - total_hours_used, 2))
    capacity_utilization = round((total_hours_used / available_hours * 100.0), 1) if available_hours > 0 else 0.0
    avg_risk_per_hr = round(total_risk_reduced / total_hours_used, 2) if total_hours_used > 0 else 0.0
    risk_pct_backlog = round((total_risk_reduced / total_backlog_risk * 100.0), 1) if total_backlog_risk > 0 else 0.0
    
    skipped_tasks = []
    for item in skipped_raw:
        cost = item['effective_hours']
        risk = item['calculated_risk']
        sev = str(item['severity']).capitalize()
        
        if cost > available_hours:
            category = 'BUDGET_EXCEEDED'
            explanation = (
                f"Exceeds total time budget: requires {cost}h effort which is greater than the entire {available_hours}h available."
            )
        elif cost > remaining_hours:
            category = 'OPPORTUNITY_COST'
            if sev in ['Critical', 'High'] and 'Knapsack' in strategy_name:
                explanation = (
                    f"This {sev} finding requires {cost}h ({risk} risk). "
                    f"With only {remaining_hours}h remaining out of {available_hours}h, selecting it would displace "
                    f"multiple high-efficiency remediations that collectively eliminate more risk."
                )
            else:
                explanation = (
                    f"Requires {cost}h, but only {remaining_hours}h remain unallocated in this budget cycle."
                )
        else:
            category = 'LOWER_EFFICIENCY'
            explanation = (
                f"Available time was allocated to other vulnerabilities delivering higher risk reduction per unit of remediation effort."
            )
            
        skipped_detail = SkippedTaskDetail(
            vulnerability_id=item['vulnerability_id'],
            title=item['title'],
            severity=item['severity'],
            cvss_score=item['cvss_score'],
            asset_name=item['asset_name'],
            estimated_hours=cost,
            calculated_risk=risk,
            risk_density=item['risk_density'],
            skip_category=category,
            explanation=explanation
        )
        skipped_tasks.append(skipped_detail)
        
    return StrategyResult(
        strategy_name=strategy_name,
        strategy_description=strategy_description,
        total_tasks_selected=len(selected_tasks),
        total_risk_reduced=total_risk_reduced,
        total_hours_used=total_hours_used,
        available_hours=available_hours,
        remaining_hours=remaining_hours,
        capacity_utilization_pct=capacity_utilization,
        avg_risk_per_hour=avg_risk_per_hr,
        risk_reduction_pct_of_backlog=risk_pct_backlog,
        selected_tasks=selected_tasks,
        skipped_tasks=skipped_tasks
    )

def compare_strategies(
    knapsack_selected: List[Dict[str, Any]],
    knapsack_skipped: List[Dict[str, Any]],
    traditional_selected: List[Dict[str, Any]],
    traditional_skipped: List[Dict[str, Any]],
    available_hours: float,
    all_items: List[Dict[str, Any]]
) -> OptimizationComparisonResponse:
    total_backlog_tasks = len(all_items)
    total_backlog_risk = round(sum(item['calculated_risk'] for item in all_items), 2)
    total_backlog_hours = round(sum(item['effective_hours'] for item in all_items), 2)
    
    knapsack_result = build_strategy_result(
        strategy_name='Optimized Knapsack',
        strategy_description='0/1 Knapsack Dynamic Programming: globally maximizes cumulative risk reduction within the strict time budget.',
        selected_raw=knapsack_selected,
        skipped_raw=knapsack_skipped,
        available_hours=available_hours,
        total_backlog_risk=total_backlog_risk,
        counterpart_selected=traditional_selected
    )
    
    traditional_result = build_strategy_result(
        strategy_name='Traditional Top-Down',
        strategy_description='Greedy Highest-Risk First: picks the highest-risk findings sequentially until time runs out.',
        selected_raw=traditional_selected,
        skipped_raw=traditional_skipped,
        available_hours=available_hours,
        total_backlog_risk=total_backlog_risk,
        counterpart_selected=knapsack_selected
    )
    
    delta_risk = round(knapsack_result.total_risk_reduced - traditional_result.total_risk_reduced, 2)
    delta_tasks = knapsack_result.total_tasks_selected - traditional_result.total_tasks_selected
    
    if traditional_result.total_risk_reduced > 0:
        risk_boost_pct = round(((knapsack_result.total_risk_reduced / traditional_result.total_risk_reduced) - 1.0) * 100.0, 1)
    else:
        risk_boost_pct = 100.0 if knapsack_result.total_risk_reduced > 0 else 0.0
        
    if delta_risk > 0:
        efficiency_summary = (
            f"0/1 Knapsack eliminated +{delta_risk} more risk points (+{risk_boost_pct}% boost) "
            f"and resolved {delta_tasks:+d} additional tasks within the exact same {available_hours}h budget."
        )
    elif delta_risk == 0:
        efficiency_summary = 'Both strategies yielded identical risk reduction for this specific time allocation.'
    else:
        efficiency_summary = f"Risk difference: {delta_risk} points."
        
    return OptimizationComparisonResponse(
        available_hours=available_hours,
        total_backlog_tasks=total_backlog_tasks,
        total_backlog_risk=total_backlog_risk,
        total_backlog_hours=total_backlog_hours,
        knapsack_strategy=knapsack_result,
        traditional_strategy=traditional_result,
        delta_risk_gain=delta_risk,
        risk_boost_pct=risk_boost_pct,
        delta_tasks_gain=delta_tasks,
        efficiency_summary=efficiency_summary
    )
