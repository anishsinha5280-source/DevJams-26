from typing import List, Dict, Any, Tuple
import math

SCALE = 100

def run_01_knapsack(items: List[Dict[str, Any]], available_hours: float) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    if not items or available_hours <= 0:
        return [], list(items)
        
    n = len(items)
    W = int(round(available_hours * SCALE))
    
    weights = [int(round(item['effective_hours'] * SCALE)) for item in items]
    values = [int(round(item['calculated_risk'] * 100)) for item in items]
    
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        w_i = weights[i - 1]
        v_i = values[i - 1]
        for w in range(W + 1):
            if w_i <= w:
                if dp[i - 1][w - w_i] + v_i > dp[i - 1][w]:
                    dp[i][w] = dp[i - 1][w - w_i] + v_i
                else:
                    dp[i][w] = dp[i - 1][w]
            else:
                dp[i][w] = dp[i - 1][w]
                
    selected_indices = set()
    curr_w = W
    for i in range(n, 0, -1):
        if dp[i][curr_w] != dp[i - 1][curr_w]:
            selected_indices.add(i - 1)
            curr_w -= weights[i - 1]
            
    selected_items = [items[i] for i in range(n) if i in selected_indices]
    selected_items.sort(key=lambda x: x['risk_density'], reverse=True)
    
    skipped_items = [items[i] for i in range(n) if i not in selected_indices]
    skipped_items.sort(key=lambda x: x['calculated_risk'], reverse=True)
    
    return selected_items, skipped_items

def run_traditional_top_down(items: List[Dict[str, Any]], available_hours: float) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    if not items or available_hours <= 0:
        return [], list(items)
        
    sorted_items = sorted(items, key=lambda x: x['calculated_risk'], reverse=True)
    
    selected_items = []
    skipped_items = []
    remaining = available_hours
    
    for item in sorted_items:
        cost = item['effective_hours']
        if cost <= remaining + 1e-6:
            selected_items.append(item)
            remaining -= cost
        else:
            skipped_items.append(item)
            
    return selected_items, skipped_items
