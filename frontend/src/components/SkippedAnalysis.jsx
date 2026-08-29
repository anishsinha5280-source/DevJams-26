import React from 'react';
import { AlertTriangle, Clock, HelpCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export default function SkippedAnalysis({ skippedTasks, availableHours, onViewFormula }) {
  if (!skippedTasks || skippedTasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center dark:bg-slate-800 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">All candidate findings fit within the current time allocation.</p>
      </div>
    );
  }

  // Filter high/critical findings to emphasize opportunity cost explainability
  const highCritSkipped = skippedTasks.filter(t => ['Critical', 'High'].includes(t.severity));
  const otherSkipped = skippedTasks.filter(t => !['Critical', 'High'].includes(t.severity));

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'OPPORTUNITY_COST':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';
      case 'BUDGET_EXCEEDED':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* High/Critical opportunity cost highlighted section */}
      {highCritSkipped.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              High & Critical Findings Skipped ({highCritSkipped.length})
            </h4>
            <span className="text-xs text-slate-500 font-normal dark:text-slate-400">
              — Deterministic Opportunity Cost Rationale
            </span>
          </div>

          <div className="space-y-2.5">
            {highCritSkipped.map((task) => (
              <div 
                key={task.vulnerability_id}
                className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-xs dark:bg-slate-800 dark:border-amber-800/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-700 dark:text-slate-200">
                        {task.vulnerability_id}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        task.severity === 'Critical' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                      }`}>
                        {task.severity} (CVSS {task.cvss_score})
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {task.asset_name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getCategoryBadge(task.skip_category)}`}>
                        {task.skip_category.replace('_', ' ')}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </h5>

                    <p className="text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/60 leading-relaxed dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-slate-300">
                      <strong className="text-amber-900 font-semibold dark:text-amber-400">Deterministic Tradeoff Analysis: </strong>
                      {task.explanation}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-700 mono dark:text-slate-300">{task.estimated_hours}h required</div>
                    <div className="text-xs text-slate-500 mono dark:text-slate-400">{task.calculated_risk} risk pts</div>
                    <div className="text-[11px] text-slate-400 mono mt-0.5 dark:text-slate-500">({task.risk_density} risk/h)</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Skipped Findings */}
      {otherSkipped.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 dark:text-slate-400">
            Other Lower Risk Findings ({otherSkipped.length})
          </h4>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs dark:bg-slate-800 dark:border-slate-700 dark:divide-slate-700">
            {otherSkipped.slice(0, 8).map((task) => (
              <div key={task.vulnerability_id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{task.vulnerability_id}</span>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-slate-700 font-medium truncate dark:text-slate-300">{task.title}</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0 text-slate-500 mono dark:text-slate-400">
                  <span>{task.estimated_hours}h</span>
                  <span>{task.calculated_risk} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
