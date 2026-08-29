import React from 'react';
import { Sparkles, Upload, ShieldCheck, Database, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function DataSourceSelector({ onLoadDemo, onOpenUpload, isDemoLoading }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/50">
      <div className="max-w-3xl mb-5">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 mb-2.5">
          <Database className="w-3.5 h-3.5" />
          <span>Quick Start Setup</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Choose Your Vulnerability Data Source
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Evaluate mathematically optimal remediation using our curated benchmark CVEs or upload your organization's scan file for automated external intelligence enrichment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Built-in Demo Dataset */}
        <div className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-5 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Instant Benchmark
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              1. Use Built-in Demo Dataset
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Populate 20 realistic CVEs (Log4Shell, XZ Utils, Outlook, WebKit) configured with CISA KEV active exploit flags and historical variance ratios.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">20 Real CVEs</span>
            <button
              onClick={onLoadDemo}
              disabled={isDemoLoading}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
              {isDemoLoading ? 'Loading Demo...' : 'Load Demo Dataset'}
            </button>
          </div>
        </div>

        {/* Option 2: Upload User CSV */}
        <div className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-5 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Auto-Enriched
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              2. Upload My Own Vulnerability File
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Import simple CSV with just <code className="text-indigo-300 font-mono bg-white/10 px-1 py-0.5 rounded">cve_id,asset_criticality</code>. The system automatically fetches CVSS from NIST NVD, EPSS from FIRST, and CISA KEV tags.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">NVD + EPSS + KEV</span>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Vulnerability CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
