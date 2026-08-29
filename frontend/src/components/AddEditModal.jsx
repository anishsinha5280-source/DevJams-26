import React, { useState, useEffect } from 'react';
import { X, Shield, Calculator, Check, AlertCircle } from 'lucide-react';

export default function AddEditModal({ isOpen, onClose, onSave, editingVuln }) {
  const [formData, setFormData] = useState({
    vulnerability_id: '',
    title: '',
    severity: 'High',
    cvss_score: 8.5,
    epss_score: 0.65,
    cisa_kev: false,
    asset_name: '',
    asset_criticality: 'High',
    remediation_type: 'Patch',
    estimated_hours: 2.0,
    description: '',
    remediation_steps: ''
  });

  const [calcRisk, setCalcRisk] = useState(0);

  useEffect(() => {
    if (editingVuln) {
      setFormData({
        vulnerability_id: editingVuln.vulnerability_id || '',
        title: editingVuln.title || '',
        severity: editingVuln.severity || 'High',
        cvss_score: editingVuln.cvss_score ?? 8.5,
        epss_score: editingVuln.epss_score ?? 0.65,
        cisa_kev: Boolean(editingVuln.cisa_kev),
        asset_name: editingVuln.asset_name || '',
        asset_criticality: editingVuln.asset_criticality || 'High',
        remediation_type: editingVuln.remediation_type || 'Patch',
        estimated_hours: editingVuln.estimated_hours ?? 2.0,
        description: editingVuln.description || '',
        remediation_steps: editingVuln.remediation_steps || ''
      });
    } else {
      setFormData({
        vulnerability_id: `VULN-${Math.floor(1000 + Math.random() * 9000)}`,
        title: '',
        severity: 'High',
        cvss_score: 8.5,
        epss_score: 0.65,
        cisa_kev: false,
        asset_name: '',
        asset_criticality: 'High',
        remediation_type: 'Patch',
        estimated_hours: 2.0,
        description: '',
        remediation_steps: ''
      });
    }
  }, [editingVuln, isOpen]);

  // Live calculation of formula
  useEffect(() => {
    const baseSev = formData.cvss_score * 10.0;
    const epssMult = 1.0 + (formData.epss_score * 1.5);
    const kevMult = formData.cisa_kev ? 2.0 : 1.0;
    const exploitFactor = epssMult * kevMult;
    
    const critMap = { Critical: 2.5, High: 1.8, Medium: 1.2, Low: 1.0 };
    const critMult = critMap[formData.asset_criticality] || 1.2;
    
    const total = baseSev * exploitFactor * critMult;
    setCalcRisk(Math.round(total * 100) / 100);
  }, [formData.cvss_score, formData.epss_score, formData.cisa_kev, formData.asset_criticality]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.asset_name) {
      alert('Please fill in finding title and asset name.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingVuln ? 'Edit Vulnerability Finding' : 'Add New Vulnerability Finding'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Finding ID & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Vulnerability ID</label>
              <input
                type="text"
                required
                disabled={Boolean(editingVuln)}
                value={formData.vulnerability_id}
                onChange={(e) => setFormData({ ...formData, vulnerability_id: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg mono font-bold focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                placeholder="CVE-2024-XXXX"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Vulnerability Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                placeholder="e.g. Remote Code Execution in API Gateway"
              />
            </div>
          </div>

          {/* Asset Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Target Asset Name</label>
              <input
                type="text"
                required
                value={formData.asset_name}
                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                placeholder="e.g. Production Database Cluster"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Asset Criticality</label>
              <select
                value={formData.asset_criticality}
                onChange={(e) => setFormData({ ...formData, asset_criticality: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="Critical">Critical (2.5x)</option>
                <option value="High">High (1.8x)</option>
                <option value="Medium">Medium (1.2x)</option>
                <option value="Low">Low (1.0x)</option>
              </select>
            </div>
          </div>

          {/* Scores: CVSS & EPSS & KEV */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 dark:bg-slate-700/50 dark:border-slate-600">
            <div className="font-bold text-slate-800 flex items-center justify-between dark:text-slate-200">
              <span>Risk Model Parameters</span>
              <span className="text-indigo-600 font-mono font-extrabold text-sm dark:text-indigo-400">
                Calculated Risk: {calcRisk} pts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 dark:text-slate-300">
                  CVSS Score: <strong className="font-mono text-slate-900 dark:text-slate-100">{formData.cvss_score}</strong>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={formData.cvss_score}
                  onChange={(e) => setFormData({ ...formData, cvss_score: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 dark:bg-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 dark:text-slate-300">
                  EPSS Probability: <strong className="font-mono text-slate-900 dark:text-slate-100">{(formData.epss_score * 100).toFixed(0)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={formData.epss_score}
                  onChange={(e) => setFormData({ ...formData, epss_score: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 dark:bg-slate-600"
                />
              </div>

              <div className="flex items-center pt-3">
                <label className="flex items-center font-bold text-slate-700 cursor-pointer dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.cisa_kev}
                    onChange={(e) => setFormData({ ...formData, cisa_kev: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2 w-4 h-4 dark:border-slate-500"
                  />
                  <span>🔥 CISA KEV (2.0x Multiplier)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Remediation Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Remediation Type</label>
              <select
                value={formData.remediation_type}
                onChange={(e) => setFormData({ ...formData, remediation_type: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="Patch">Patch</option>
                <option value="Configuration">Configuration</option>
                <option value="Isolation">Isolation</option>
                <option value="WAF Rule">WAF Rule</option>
                <option value="Credential Rotation">Credential Rotation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                required
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0.5 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg mono focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Severity Category</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Remediation Steps */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Remediation Steps & Notes</label>
            <textarea
              rows={2}
              value={formData.remediation_steps}
              onChange={(e) => setFormData({ ...formData, remediation_steps: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              placeholder="e.g. Deploy hotfix KB123456 and restart service during maintenance window."
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold shadow-xs cursor-pointer"
            >
              {editingVuln ? 'Save Changes' : 'Create Finding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
