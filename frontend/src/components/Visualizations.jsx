import React from 'react';
import { BarChart3, PieChart, Shield, Zap, TrendingUp } from 'lucide-react';

export default function Visualizations({ comparison, summary }) {
  if (!comparison) return null;

  const knapRisk = comparison.knapsack_strategy?.total_risk_reduced || 0;
  const tradRisk = comparison.traditional_strategy?.total_risk_reduced || 0;
  const maxRisk = Math.max(knapRisk, tradRisk, 1);

  const knapPct = Math.round((knapRisk / maxRisk) * 100);
  const tradPct = Math.round((tradRisk / maxRisk) * 100);

  const crit = summary?.critical_count || 0;
  const high = summary?.high_count || 0;
  const med = summary?.medium_count || 0;
  const low = summary?.low_count || 0;
  const totalVulns = Math.max(1, crit + high + med + low);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Risk Reduction Comparison Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Risk Reduction Comparison
            </h4>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-900/40 dark:text-indigo-300">
            Points Removed
          </span>
        </div>

        <div className="space-y-4">
          {/* 0/1 Knapsack Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-indigo-900 flex items-center dark:text-indigo-300">
                <Zap className="w-3.5 h-3.5 text-indigo-600 mr-1 dark:text-indigo-400" />
                0/1 Knapsack Optimizer
              </span>
              <span className="text-indigo-600 font-bold mono dark:text-indigo-400">{knapRisk} pts</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden dark:bg-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-3.5 rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${knapPct}%` }}
              />
            </div>
          </div>

          {/* Traditional Baseline Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-400">Traditional Top-Down (Greedy)</span>
              <span className="text-slate-700 font-bold mono dark:text-slate-300">{tradRisk} pts</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden dark:bg-slate-700">
              <div
                className="bg-slate-400 h-3.5 rounded-full transition-all duration-700 dark:bg-slate-500"
                style={{ width: `${tradPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <span>Relative Efficiency Boost</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {comparison.risk_boost_pct > 0 ? `+${comparison.risk_boost_pct}% Advantage` : 'Parity'}
          </span>
        </div>
      </div>

      {/* Severity Backlog Composition */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Active Backlog Severity
            </h4>
          </div>
          <span className="text-xs text-slate-500 mono dark:text-slate-400">{totalVulns} Total</span>
        </div>

        {/* Stacked Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex mb-3 dark:bg-slate-700">
          <div style={{ width: `${(crit / totalVulns) * 100}%` }} className="bg-rose-500 h-full" title={`Critical: ${crit}`} />
          <div style={{ width: `${(high / totalVulns) * 100}%` }} className="bg-amber-500 h-full" title={`High: ${high}`} />
          <div style={{ width: `${(med / totalVulns) * 100}%` }} className="bg-blue-500 h-full" title={`Medium: ${med}`} />
          <div style={{ width: `${(low / totalVulns) * 100}%` }} className="bg-slate-400 h-full" title={`Low: ${low}`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600 font-medium dark:text-slate-400">Critical ({crit})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600 font-medium dark:text-slate-400">High ({high})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-slate-600 font-medium dark:text-slate-400">Medium ({med})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <span className="text-slate-600 font-medium dark:text-slate-400">Low ({low})</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <span>CISA KEV Exploited in Wild</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">{summary?.cisa_kev_active_count || 0} CVEs</span>
        </div>
      </div>
    </div>
  );
}
