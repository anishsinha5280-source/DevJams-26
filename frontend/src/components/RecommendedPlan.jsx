import React, { useState } from 'react';
import { CheckCircle2, Clock, Zap, Shield, Server, Wrench, ChevronRight, HelpCircle } from 'lucide-react';

export default function RecommendedPlan({ tasks, onMarkComplete, onViewFormula }) {
  // Track inline actual-hours input per task
  const [actualHoursMap, setActualHoursMap] = useState({});

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center dark:bg-slate-800 dark:border-slate-700">
        <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2 dark:text-slate-600" />
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Tasks Selected</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 dark:text-slate-400">
          Increase available remediation hours or ensure there are pending vulnerabilities in the backlog.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const getCriticalityBadge = (crit) => {
    switch (crit?.toLowerCase()) {
      case 'critical':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'high':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
      case 'medium':
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600';
    }
  };

  const handleActualHoursChange = (vulnId, value) => {
    setActualHoursMap(prev => ({ ...prev, [vulnId]: value }));
  };

  const handleMarkCompleteWithHours = (task) => {
    const actualHours = actualHoursMap[task.vulnerability_id];
    if (actualHours !== undefined && actualHours !== '' && parseFloat(actualHours) > 0) {
      // Pass actual hours along with the task for direct completion
      onMarkComplete({ ...task, _actualHours: parseFloat(actualHours) });
    } else {
      // Fall back to modal for actual hours input
      onMarkComplete(task);
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div 
          key={task.vulnerability_id}
          className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-indigo-300 transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-600"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            {/* Left Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mono">
                  #{task.selection_order}
                </span>
                <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700">
                  {task.vulnerability_id}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getSeverityBadge(task.severity)}`}>
                  {task.severity}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                  CVSS {task.cvss_score}
                </span>
                {task.cisa_kev && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700">
                    🔥 CISA KEV Exploited
                  </span>
                )}
                <span className="text-xs text-slate-500 flex items-center dark:text-slate-400">
                  <Server className="w-3 h-3 mr-1 text-slate-400" />
                  {task.asset_name}
                </span>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${getCriticalityBadge(task.asset_criticality)}`}>
                  Asset: {task.asset_criticality}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug dark:text-slate-100">
                {task.title}
              </h4>

              {/* Explainability Pill */}
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-start space-x-2 text-xs text-slate-700 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 dark:text-indigo-400" />
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Why Selected: </span>
                  {task.selection_reason}
                </div>
              </div>
            </div>

            {/* Right Metrics & Action */}
            <div className="flex sm:flex-col items-end justify-between shrink-0 gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700">
              <div className="text-right">
                <div className="flex items-center space-x-2 justify-end">
                  <span className="text-xs text-slate-500 font-medium dark:text-slate-400">Risk Reduction:</span>
                  <span className="text-sm font-extrabold text-indigo-600 mono dark:text-indigo-400">
                    -{task.calculated_risk} pts
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-end space-x-2 mt-0.5 dark:text-slate-400">
                  <span>Effort: <strong className="text-slate-700 font-mono dark:text-slate-300">{task.estimated_hours}h</strong></span>
                  <span>•</span>
                  <span>Density: <strong className="text-emerald-600 font-mono dark:text-emerald-400">{task.risk_density} r/h</strong></span>
                </div>
              </div>

              {/* Actual Remediation Time Inline Input (Point 1) */}
              <div className="flex items-center space-x-1.5">
                <label className="text-[11px] text-slate-500 font-medium dark:text-slate-400 whitespace-nowrap">
                  <Clock className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                  Actual:
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder={`${task.estimated_hours}`}
                  value={actualHoursMap[task.vulnerability_id] ?? ''}
                  onChange={(e) => handleActualHoursChange(task.vulnerability_id, e.target.value)}
                  className="w-16 px-1.5 py-1 text-xs mono font-semibold border border-slate-200 rounded-md text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500">hrs</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onViewFormula(task)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-600"
                  title="View formula breakdown"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkCompleteWithHours(task)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
