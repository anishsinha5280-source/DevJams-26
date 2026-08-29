import React from 'react';
import { Shield, Sparkles, Upload, Plus, HelpCircle, Download, RefreshCw, Moon, Sun } from 'lucide-react';

export default function Header({ 
  onLoadDemo, 
  onOpenUpload, 
  onOpenAdd, 
  onOpenFormula, 
  onExportReport,
  isDemoLoading,
  darkMode,
  onToggleDarkMode
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-sm shadow-indigo-200 text-white dark:shadow-indigo-900/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight dark:text-slate-100">
                  Cybersecurity Risk Prioritization System
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700">
                  0/1 Knapsack DP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
                Deterministic, Budget-Constrained Remediation Optimization Engine
              </p>
            </div>
          </div>

          {/* Global Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-600"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={onLoadDemo}
              disabled={isDemoLoading}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Instantly populate realistic 20-CVE test dataset"
            >
              <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
              {isDemoLoading ? 'Loading Demo...' : 'Load Demo Dataset'}
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 transition-colors cursor-pointer dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
              Upload CSV
            </button>

            <button
              onClick={onOpenAdd}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Finding
            </button>

            <button
              onClick={onOpenFormula}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-600"
              title="View deterministic risk calculation formula"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Risk Formula
            </button>

            <button
              onClick={onExportReport}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-600"
              title="Export active optimization plan"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Export
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
