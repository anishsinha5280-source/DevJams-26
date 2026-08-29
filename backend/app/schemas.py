from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any

class RiskBreakdown(BaseModel):
    cvss_score: float
    base_severity_score: float
    epss_score: float
    epss_multiplier: float
    cisa_kev: bool
    cisa_kev_multiplier: float
    asset_criticality: str
    asset_criticality_multiplier: float
    total_risk_score: float
    risk_density: float
    explanation: str

class VulnerabilityBase(BaseModel):
    vulnerability_id: str
    title: str
    severity: str
    cvss_score: float = Field(ge=0.0, le=10.0)
    epss_score: float = Field(ge=0.0, le=1.0, default=0.05)
    cisa_kev: bool = False
    asset_name: str
    asset_criticality: str = 'Medium'
    remediation_type: str = 'Patch'
    estimated_hours: float = Field(gt=0.0)
    actual_hours: Optional[float] = 0.0
    status: str = 'pending'
    description: Optional[str] = ''
    remediation_steps: Optional[str] = ''

    @field_validator('severity')
    def validate_severity(cls, v):
        v_title = str(v).capitalize()
        if v_title not in ['Critical', 'High', 'Medium', 'Low']:
            return 'Medium'
        return v_title

    @field_validator('asset_criticality')
    def validate_criticality(cls, v):
        v_title = str(v).capitalize()
        if v_title not in ['Critical', 'High', 'Medium', 'Low']:
            return 'Medium'
        return v_title

    @field_validator('status')
    def validate_status(cls, v):
        v_lower = str(v).lower()
        if v_lower not in ['pending', 'completed']:
            return 'pending'
        return v_lower

class VulnerabilityCreate(VulnerabilityBase):
    pass

class VulnerabilityUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    cvss_score: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    epss_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    cisa_kev: Optional[bool] = None
    asset_name: Optional[str] = None
    asset_criticality: Optional[str] = None
    remediation_type: Optional[str] = None
    estimated_hours: Optional[float] = Field(default=None, gt=0.0)
    actual_hours: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None
    remediation_steps: Optional[str] = None

class VulnerabilityResponse(VulnerabilityBase):
    calculated_risk: float
    risk_breakdown: RiskBreakdown
    feedback_count: int = 0
    created_at: Optional[str] = None

class HistoricalAdjustment(BaseModel):
    id: Optional[int] = None
    remediation_type: str
    estimated_hours: float
    actual_hours: float
    variance_ratio: float
    created_at: Optional[str] = None

class TaskSelectionDetail(BaseModel):
    vulnerability_id: str
    title: str
    severity: str
    cvss_score: float
    epss_score: float
    cisa_kev: bool
    asset_name: str
    asset_criticality: str
    remediation_type: str
    estimated_hours: float
    calculated_risk: float
    risk_density: float
    risk_breakdown: RiskBreakdown
    selection_order: int
    cumulative_hours: float
    cumulative_risk: float
    selection_reason: str

class SkippedTaskDetail(BaseModel):
    vulnerability_id: str
    title: str
    severity: str
    cvss_score: float
    asset_name: str
    estimated_hours: float
    calculated_risk: float
    risk_density: float
    skip_category: str
    explanation: str

class StrategyResult(BaseModel):
    strategy_name: str
    strategy_description: str
    total_tasks_selected: int
    total_risk_reduced: float
    total_hours_used: float
    available_hours: float
    remaining_hours: float
    capacity_utilization_pct: float
    avg_risk_per_hour: float
    risk_reduction_pct_of_backlog: float
    selected_tasks: List[TaskSelectionDetail]
    skipped_tasks: List[SkippedTaskDetail]

class OptimizationComparisonResponse(BaseModel):
    available_hours: float
    total_backlog_tasks: int
    total_backlog_risk: float
    total_backlog_hours: float
    knapsack_strategy: StrategyResult
    traditional_strategy: StrategyResult
    delta_risk_gain: float
    risk_boost_pct: float
    delta_tasks_gain: int
    efficiency_summary: str

class OptimizationRequest(BaseModel):
    available_hours: float = Field(gt=0.0, le=500.0, default=5.0)
    use_historical_adjustments: bool = True
    excluded_vulnerability_ids: Optional[List[str]] = []
    included_only_vulnerability_ids: Optional[List[str]] = []

class CSVImportSummary(BaseModel):
    total_rows: int
    successfully_imported: int
    errors: List[str]
