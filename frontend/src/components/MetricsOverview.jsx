import React from 'react';
import { AlertCircle, Flame, Clock, TrendingUp, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function MetricsOverview({ summary, comparison }) {
  const critCount = summary?.critical_count || 0;
  const highCount = summary?.high_count || 0;
  const totalRisk = summary?.total_pending_risk || 0;
  const totalHours = summary?.total_pending_hours || 0;
  const pendingCount = summary?.pending_count || 0;
  const cisaCount = summary?.cisa_kev_active_count || 0;

  const boostPct = comparison?.risk_boost_pct || 0;
  const deltaRisk = comparison?.delta_risk_gain || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Total Pending */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Backlog Items</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold text-slate-900 mono dark:text-slate-100">{pendingCount}</div>
          <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
            {summary?.completed_count || 0} completed
          </p>
        </div>
      </div>

      {/* Critical & High */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Critical & High</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold text-rose-600 mono dark:text-rose-400">
            {critCount + highCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
            <span className="font-semibold text-rose-700 dark:text-rose-400">{critCount} Critical</span>, {highCount} High
          </p>
        </div>
      </div>

      {/* CISA KEV Exploited in Wild */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CISA KEV Active</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold text-amber-600 mono dark:text-amber-400">{cisaCount}</div>
          <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">2.0x Priority Multiplier</p>
        </div>
      </div>

      {/* Total Risk & Effort */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Backlog Effort</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold text-slate-900 mono dark:text-slate-100">{totalHours.toFixed(1)}h</div>
          <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
            {totalRisk.toLocaleString()} total risk pts
          </p>
        </div>
      </div>

      {/* Optimization Lift */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1 dark:from-indigo-950/50 dark:to-blue-950/50 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">Knapsack Advantage</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold text-indigo-700 mono dark:text-indigo-400">
            {boostPct > 0 ? `+${boostPct}%` : '0%'}
          </div>
          <p className="text-xs text-indigo-950 font-medium mt-0.5 dark:text-indigo-300">
            {deltaRisk > 0 ? `+${deltaRisk} more risk eliminated` : 'Optimal global selection'}
          </p>
        </div>
      </div>
    </div>
  );
}
