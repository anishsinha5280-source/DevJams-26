import React from 'react';
import { ArrowRight, CheckCircle, TrendingUp, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';

export default function StrategyComparison({ comparison }) {
  if (!comparison) return null;

  const {
    available_hours,
    knapsack_strategy: knap,
    traditional_strategy: trad,
    delta_risk_gain,
    risk_boost_pct,
    delta_tasks_gain,
    efficiency_summary
  } = comparison;

  return (
    <div className="space-y-4">
      {/* Advantage Banner */}
      {delta_risk_gain > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-xl p-4 shadow-xs dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/40 dark:border-emerald-800/60">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded dark:bg-emerald-900/60 dark:text-emerald-300">
                  0/1 Knapsack Advantage Verified
                </span>
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  +{delta_risk_gain} Additional Risk Points Eliminated (+{risk_boost_pct}%)
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 dark:text-slate-300">
                {efficiency_summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traditional Strategy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Baseline Method</span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Traditional Top-Down Strategy</h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                Greedy Sorting
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">
              Sequentially selects highest-severity findings until time capacity is exhausted.
            </p>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 dark:bg-slate-750 dark:bg-slate-700/50 dark:border-slate-600">
                <span className="text-xs text-slate-500 dark:text-slate-400">Tasks Remediated</span>
                <div className="text-xl font-bold text-slate-800 mono dark:text-slate-200">{trad?.total_tasks_selected}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 dark:bg-slate-700/50 dark:border-slate-600">
                <span className="text-xs text-slate-500 dark:text-slate-400">Risk Reduced</span>
                <div className="text-xl font-bold text-slate-800 mono dark:text-slate-200">{trad?.total_risk_reduced}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 dark:bg-slate-700/50 dark:border-slate-600">
                <span className="text-xs text-slate-500 dark:text-slate-400">Time Utilized</span>
                <div className="text-xl font-bold text-slate-800 mono dark:text-slate-200">
                  {trad?.total_hours_used}h <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {available_hours}h</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 dark:bg-slate-700/50 dark:border-slate-600">
                <span className="text-xs text-slate-500 dark:text-slate-400">Avg Risk / Hour</span>
                <div className="text-xl font-bold text-slate-800 mono dark:text-slate-200">{trad?.avg_risk_per_hour}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1 dark:text-slate-400">
                <span>Time Budget Utilization</span>
                <span className="font-semibold dark:text-slate-300">{trad?.capacity_utilization_pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden dark:bg-slate-700">
                <div 
                  className="bg-slate-400 h-2 rounded-full transition-all duration-500 dark:bg-slate-500" 
                  style={{ width: `${Math.min(100, trad?.capacity_utilization_pct || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Knapsack Strategy */}
        <div className="bg-white rounded-xl border-2 border-indigo-500/80 p-5 shadow-sm shadow-indigo-100 flex flex-col justify-between dark:bg-slate-800 dark:border-indigo-500/60 dark:shadow-none">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-indigo-50 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Optimal Method</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">0/1 Knapsack Optimizer</h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white shadow-xs">
                Globally Optimal
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 dark:text-slate-300">
              Dynamic programming solves for the global maximum risk reduction within available hours.
            </p>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-900 font-medium dark:text-indigo-300">Tasks Remediated</span>
                  {delta_tasks_gain > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded dark:bg-emerald-900/60 dark:text-emerald-300">
                      +{delta_tasks_gain} tasks
                    </span>
                  )}
                </div>
                <div className="text-xl font-extrabold text-indigo-900 mono dark:text-indigo-200">{knap?.total_tasks_selected}</div>
              </div>
              <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-900 font-medium dark:text-indigo-300">Risk Reduced</span>
                  {delta_risk_gain > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded dark:bg-emerald-900/60 dark:text-emerald-300">
                      +{delta_risk_gain} pts
                    </span>
                  )}
                </div>
                <div className="text-xl font-extrabold text-indigo-900 mono dark:text-indigo-200">{knap?.total_risk_reduced}</div>
              </div>
              <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/60">
                <span className="text-xs text-indigo-900 font-medium dark:text-indigo-300">Time Utilized</span>
                <div className="text-xl font-extrabold text-indigo-900 mono dark:text-indigo-200">
                  {knap?.total_hours_used}h <span className="text-xs font-normal text-indigo-700 dark:text-indigo-400">/ {available_hours}h</span>
                </div>
              </div>
              <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/60">
                <span className="text-xs text-indigo-900 font-medium dark:text-indigo-300">Avg Risk / Hour</span>
                <div className="text-xl font-extrabold text-indigo-900 mono dark:text-indigo-200">{knap?.avg_risk_per_hour}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-indigo-900 mb-1 dark:text-indigo-300">
                <span>Time Budget Utilization</span>
                <span className="font-bold dark:text-indigo-200">{knap?.capacity_utilization_pct}%</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden dark:bg-slate-700">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, knap?.capacity_utilization_pct || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
