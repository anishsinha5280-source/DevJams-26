import React, { useState } from 'react';
import { X, HelpCircle, Calculator, Sparkles, Shield } from 'lucide-react';

export default function RiskFormulaModal({ isOpen, onClose, selectedVuln }) {
  const [cvss, setCvss] = useState(selectedVuln?.cvss_score ?? 9.8);
  const [epss, setEpss] = useState(selectedVuln?.epss_score ?? 0.88);
  const [cisaKev, setCisaKev] = useState(Boolean(selectedVuln?.cisa_kev ?? true));
  const [crit, setCrit] = useState(selectedVuln?.asset_criticality ?? 'Critical');
  const [hours, setHours] = useState(selectedVuln?.estimated_hours ?? 1.5);

  if (!isOpen) return null;

  // Calculation
  const baseSeverity = cvss * 10.0;
  const epssMultiplier = 1.0 + (epss * 1.5);
  const kevMultiplier = cisaKev ? 2.0 : 1.0;
  const exploitFactor = epssMultiplier * kevMultiplier;
  
  const critMap = { Critical: 2.5, High: 1.8, Medium: 1.2, Low: 1.0 };
  const critMultiplier = critMap[crit] || 1.2;
  
  const calculatedRisk = Math.round(baseSeverity * exploitFactor * critMultiplier * 100) / 100;
  const riskDensity = Math.round((calculatedRisk / Math.max(0.1, hours)) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Deterministic Risk Model & Formula
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Formula Overview */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-2 dark:bg-indigo-950/40 dark:border-indigo-800/60">
            <h4 className="font-bold text-indigo-950 text-sm dark:text-indigo-300">Transparent Formula Structure</h4>
            <div className="bg-white p-3 rounded-lg border border-indigo-200/60 font-mono text-xs text-indigo-900 text-center font-bold dark:bg-slate-900 dark:border-indigo-700 dark:text-indigo-300">
              Risk = Base Severity × Exploit Factor × Asset Criticality Factor
            </div>
            <p className="text-slate-600 text-xs dark:text-slate-300">
              Every point of risk reduction is completely deterministic, objective, and explainable without opaque AI weights or non-reproducible scoring.
            </p>
          </div>

          {/* Breakdown parameters table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] dark:text-slate-200">Component Multipliers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600">
                <span className="font-bold text-slate-700 block dark:text-slate-300">1. Base Severity</span>
                <span className="font-mono text-slate-600 mt-1 block dark:text-slate-400">CVSS Score × 10.0</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Scale: 0.0 to 100.0</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600">
                <span className="font-bold text-slate-700 block dark:text-slate-300">2. Exploit Factor</span>
                <span className="font-mono text-slate-600 mt-1 block dark:text-slate-400">(1 + EPSS × 1.5) × KEV</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">KEV = 2.0x if active</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600">
                <span className="font-bold text-slate-700 block dark:text-slate-300">3. Asset Criticality</span>
                <span className="font-mono text-slate-600 mt-1 block dark:text-slate-400">Crit: 2.5x, High: 1.8x</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Med: 1.2x, Low: 1.0x</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Sandbox */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-200">Interactive Formula Sandbox</span>
              <span className="text-xs text-indigo-600 font-mono font-bold dark:text-indigo-400">
                {calculatedRisk} Total Risk Points
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 dark:text-slate-300">
                  CVSS Score: <strong className="mono text-slate-900 dark:text-slate-100">{cvss}</strong> ({baseSeverity} base)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={cvss}
                  onChange={(e) => setCvss(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 dark:bg-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 dark:text-slate-300">
                  EPSS Probability: <strong className="mono text-slate-900 dark:text-slate-100">{(epss * 100).toFixed(0)}%</strong> ({epssMultiplier.toFixed(2)}x)
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={epss}
                  onChange={(e) => setEpss(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 dark:bg-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 dark:text-slate-300">Asset Criticality Tier</label>
                <select
                  value={crit}
                  onChange={(e) => setCrit(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                >
                  <option value="Critical">Critical (2.5x Multiplier)</option>
                  <option value="High">High (1.8x Multiplier)</option>
                  <option value="Medium">Medium (1.2x Multiplier)</option>
                  <option value="Low">Low (1.0x Multiplier)</option>
                </select>
              </div>

              <div className="flex items-center pt-3">
                <label className="flex items-center font-bold text-slate-700 cursor-pointer dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={cisaKev}
                    onChange={(e) => setCisaKev(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2 w-4 h-4 dark:border-slate-500"
                  />
                  <span>CISA Known Exploited in Wild (2.0x)</span>
                </label>
              </div>
            </div>

            {/* Calculated Step Breakdown */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-700 space-y-1 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300">
              <div>Base Severity: {baseSeverity.toFixed(1)}</div>
              <div>Exploit Factor: {epssMultiplier.toFixed(3)} {cisaKev ? '× 2.0 (KEV)' : ''} = {exploitFactor.toFixed(3)}</div>
              <div>Asset Factor: {critMultiplier}x ({crit})</div>
              <div className="pt-1 font-bold text-indigo-700 border-t border-slate-200 flex justify-between dark:text-indigo-400 dark:border-slate-600">
                <span>Result: {baseSeverity.toFixed(1)} × {exploitFactor.toFixed(3)} × {critMultiplier}</span>
                <span>= {calculatedRisk} Risk Points</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
