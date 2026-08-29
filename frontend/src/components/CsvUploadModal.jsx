import React, { useState } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle, Sparkles, Shield } from 'lucide-react';
import { uploadCsv } from '../services/api';

export default function CsvUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadCsv(file);
      setResult(res);
      if (res.successfully_imported > 0) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to upload CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Vulnerabilities CSV</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-slate-600 leading-relaxed dark:text-slate-300">
              Upload your custom vulnerability scan using the simplified schema containing only:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] border border-slate-700">
              <div className="text-indigo-400 font-bold">cve_id,asset_criticality</div>
              <div className="text-slate-300">CVE-2021-44228,Critical</div>
              <div className="text-slate-300">CVE-2024-21413,High</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200/80 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 dark:text-indigo-400" />
              <span>
                <strong>Automated Live Intelligence:</strong> The backend automatically extracts CVSS base scores from <strong>NIST NVD</strong>, exploit probabilities from <strong>FIRST EPSS</strong>, and actively exploited status from <strong>CISA KEV</strong>.
              </span>
            </div>
          </div>

          {/* Download Template */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between dark:bg-slate-700/50 dark:border-slate-600">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Download sample template</span>
            </div>
            <a
              href="/api/vulnerabilities/template.csv"
              download="vulnerabilities_template.csv"
              className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download CSV
            </a>
          </div>

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors relative dark:border-slate-600 dark:hover:border-indigo-500">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 dark:text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 block dark:text-slate-300">
              {file ? file.name : 'Click to select or drag & drop .csv file'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block dark:text-slate-500">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Accepts simplified CVE CSV or standard vulnerability scanner export'}
            </span>
          </div>

          {/* Status feedback */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 flex items-start space-x-2 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 space-y-1 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
              <div className="flex items-center font-bold">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Successfully imported and enriched {result.successfully_imported} vulnerabilities.
              </div>
              {result.errors?.length > 0 && (
                <div className="text-[11px] text-amber-800 mt-1 pt-1 border-t border-emerald-200 dark:text-amber-300 dark:border-emerald-800">
                  <span className="font-semibold">Warnings ({result.errors.length}):</span>
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                    {result.errors.slice(0, 3).map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Enriching & Importing...' : 'Upload & Enrich'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
