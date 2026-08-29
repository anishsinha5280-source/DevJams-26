import React from 'react';
import { Clock, Sliders, Zap, History } from 'lucide-react';

export default function TimeBudgetControl({
  availableHours,
  setAvailableHours,
  onRunOptimization,
  isLoading
}) {
  const PRESETS = [2.0, 5.0, 10.0, 20.0];

  const handleSliderChange = (e) => {
    setAvailableHours(parseFloat(e.target.value));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Allow empty field while typing
    if (val === '') return;
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0.5 && num <= 40.0) {
      setAvailableHours(num);
    }
  };

  const handleInputBlur = (e) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val < 0.5) {
      setAvailableHours(0.5);
    } else if (val > 40.0) {
      setAvailableHours(40.0);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Input & Slider */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center text-sm font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Available Remediation Time Budget
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium dark:text-slate-400">Available Time:</span>
              <input
                type="number"
                min="0.5"
                max="40.0"
                step="0.5"
                value={availableHours}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-20 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-md font-bold text-indigo-700 text-sm mono text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300"
              />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">hrs</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0.5"
              max="40.0"
              step="0.5"
              value={availableHours}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-600"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 dark:text-slate-400">Quick Presets:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAvailableHours(preset)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                  availableHours === preset
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600'
                }`}
              >
                {preset === 5.0 ? '⚡ 5.0h (Benchmark)' : `${preset.toFixed(1)}h`}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Run Button */}
        <div className="lg:border-l lg:border-slate-200 lg:pl-5 flex items-center dark:lg:border-slate-700">
          <button
            type="button"
            onClick={onRunOptimization}
            disabled={isLoading}
            className="w-full lg:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 mr-2 ${isLoading ? 'animate-pulse' : ''}`} />
            {isLoading ? 'Optimizing...' : 'Calculate Optimal Selection'}
          </button>
        </div>
      </div>
    </div>
  );
}
