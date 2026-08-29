import React, { useState } from 'react';
import { X, CheckCircle2, Clock, History } from 'lucide-react';

export default function CompleteTaskModal({ isOpen, onClose, task, onConfirm }) {
  const [actualHours, setActualHours] = useState(task?.estimated_hours || 1.0);

  if (!isOpen || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(task.vulnerability_id, parseFloat(actualHours) || task.estimated_hours);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Mark Remediation Complete</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 dark:bg-slate-700/50 dark:border-slate-600">
            <span className="font-mono font-bold text-slate-900 text-xs dark:text-slate-100">{task.vulnerability_id}</span>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</h4>
            <div className="text-slate-500 text-[11px] pt-1 dark:text-slate-400">
              Estimated: <strong className="font-mono text-slate-700 dark:text-slate-300">{task.estimated_hours} hrs</strong> • Type: {task.remediation_type}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Actual Hours Spent</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg mono text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              placeholder="e.g. 1.8"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center dark:text-slate-400">
              <History className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0 dark:text-slate-500" />
              Used by historical engine to adjust future duration estimates.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer"
            >
              Confirm Completion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
