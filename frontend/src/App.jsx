import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DataSourceSelector from './components/DataSourceSelector';
import MetricsOverview from './components/MetricsOverview';
import TimeBudgetControl from './components/TimeBudgetControl';
import StrategyComparison from './components/StrategyComparison';
import RecommendedPlan from './components/RecommendedPlan';
import SkippedAnalysis from './components/SkippedAnalysis';
import Visualizations from './components/Visualizations';
import VulnerabilityTable from './components/VulnerabilityTable';
import AddEditModal from './components/AddEditModal';
import CsvUploadModal from './components/CsvUploadModal';
import RiskFormulaModal from './components/RiskFormulaModal';
import CompleteTaskModal from './components/CompleteTaskModal';

import {
  fetchVulnerabilities,
  fetchMetricsSummary,
  runOptimization,
  loadDemoData,
  createVulnerability,
  updateVulnerability,
  deleteVulnerability,
  undoFeedback,
  clearFeedback
} from './services/api';

import { 
  Zap, 
  ListChecks, 
  Layers, 
  BarChart2, 
  HelpCircle, 
  AlertTriangle, 
  Sparkles,
  Info,
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';

export default function App() {
  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [metricsSummary, setMetricsSummary] = useState(null);
  const [availableHours, setAvailableHours] = useState(5.0);
  const [comparison, setComparison] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'backlog' | 'comparison' | 'charts'
  
  // Filters for backlog table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVuln, setEditingVuln] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedVulnForFormula, setSelectedVulnForFormula] = useState(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch full data & recalculate optimization
  const loadAllData = useCallback(async (hours = availableHours) => {
    setIsLoading(true);
    try {
      const [vulns, summary, optResult] = await Promise.all([
        fetchVulnerabilities(),
        fetchMetricsSummary(),
        runOptimization({
          available_hours: hours,
          use_historical_adjustments: true
        })
      ]);
      setVulnerabilities(vulns);
      setMetricsSummary(summary);
      setComparison(optResult);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading system data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [availableHours]);

  // Initial mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Automatic recalculation when available hours change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllData(availableHours);
    }, 250);
    return () => clearTimeout(timer);
  }, [availableHours]);

  // Demo loader
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await loadDemoData();
      await loadAllData(5.0);
      setAvailableHours(5.0);
      showToast(`Loaded ${res.vulnerabilities_count} realistic CVEs with structured 0/1 knapsack test benchmark!`);
    } catch (err) {
      showToast('Failed to load demo data', 'error');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Save finding
  const handleSaveFinding = async (formData) => {
    try {
      if (editingVuln) {
        await updateVulnerability(editingVuln.vulnerability_id, formData);
        showToast(`Updated finding ${editingVuln.vulnerability_id}`);
      } else {
        await createVulnerability(formData);
        showToast(`Created finding ${formData.vulnerability_id}`);
      }
      setIsAddModalOpen(false);
      setEditingVuln(null);
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Error saving finding', 'error');
    }
  };

  // Inline hours edit
  const handleUpdateHours = async (id, newHours) => {
    try {
      await updateVulnerability(id, { estimated_hours: newHours });
      showToast(`Updated ${id} effort to ${newHours}h`);
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle status
  const handleToggleStatus = (vuln) => {
    // Tasks from optimization results don't have a 'status' field — they are always pending
    const status = vuln.status || 'pending';
    if (status === 'pending') {
      // If inline actual hours were provided from RecommendedPlan, complete directly
      if (vuln._actualHours) {
        handleConfirmComplete(vuln.vulnerability_id, vuln._actualHours);
      } else {
        setTaskToComplete(vuln);
        setIsCompleteModalOpen(true);
      }
    } else {
      // Revert to pending
      updateVulnerability(vuln.vulnerability_id, { status: 'pending' })
        .then(() => {
          showToast(`Reopened ${vuln.vulnerability_id}`);
          loadAllData();
        })
        .catch(err => showToast(err.message, 'error'));
    }
  };

  // Confirm completion with actual hours
  const handleConfirmComplete = async (vulnId, actualHours) => {
    try {
      await updateVulnerability(vulnId, {
        status: 'completed',
        actual_hours: actualHours
      });
      showToast(`Completed ${vulnId} (${actualHours}h recorded for historical learning)`);
      setIsCompleteModalOpen(false);
      setTaskToComplete(null);
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Point 2: Undo latest feedback entry for a specific vulnerability
  const handleUndoFeedback = async (vuln) => {
    try {
      const res = await undoFeedback(vuln.vulnerability_id);
      showToast(res.message || `Undid latest feedback for ${vuln.vulnerability_id}`);
      await loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to undo feedback', 'error');
    }
  };

  // Point 2: Clear all feedback history for a specific vulnerability
  const handleClearFeedback = async (vuln) => {
    if (confirm(`Clear all feedback history for ${vuln.vulnerability_id}? (Finding will remain intact)`)) {
      try {
        const res = await clearFeedback(vuln.vulnerability_id);
        showToast(res.message || `Cleared feedback history for ${vuln.vulnerability_id}`);
        await loadAllData();
      } catch (err) {
        showToast(err.message || 'Failed to clear feedback', 'error');
      }
    }
  };

  // Delete finding
  const handleDelete = async (vuln) => {
    if (confirm(`Are you sure you want to delete finding ${vuln.vulnerability_id}?`)) {
      try {
        await deleteVulnerability(vuln.vulnerability_id);
        showToast(`Deleted ${vuln.vulnerability_id}`);
        await loadAllData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Open formula breakdown modal
  const handleOpenFormula = (vuln) => {
    setSelectedVulnForFormula(vuln || null);
    setIsFormulaModalOpen(true);
  };

  // Export JSON Report
  const handleExportReport = () => {
    if (!comparison) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(comparison, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `remediation_plan_${availableHours}h.json`);
    dlAnchor.click();
    showToast('Remediation optimization plan exported');
  };

  // Filtered vulnerabilities for table view
  const filteredVulns = vulnerabilities.filter((v) => {
    const matchesSearch = !searchTerm || (
      v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vulnerability_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.asset_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = !statusFilter || v.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesSeverity = !severityFilter || v.severity?.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 ${
            toast.type === 'error' 
              ? 'bg-rose-900 text-rose-50 border-rose-800' 
              : 'bg-slate-900 text-slate-50 border-slate-800 dark:bg-slate-700 dark:border-slate-600'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        onLoadDemo={handleLoadDemo}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenAdd={() => { setEditingVuln(null); setIsAddModalOpen(true); }}
        onOpenFormula={() => handleOpenFormula(null)}
        onExportReport={handleExportReport}
        isDemoLoading={isDemoLoading}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Point 3: Data Source Quick-Start Choice: Demo vs Upload */}
        <DataSourceSelector
          onLoadDemo={handleLoadDemo}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          isDemoLoading={isDemoLoading}
        />

        {/* KPI Metrics */}
        <MetricsOverview summary={metricsSummary} comparison={comparison} />

        {/* Time Budget Controller (Point 1: button removed, auto-recalculates on edit) */}
        <TimeBudgetControl
          availableHours={availableHours}
          setAvailableHours={setAvailableHours}
        />

        {/* Strategy Comparison Component */}
        <StrategyComparison comparison={comparison} />

        {/* Navigation Tabs (Point 4: Skipped renamed to Deferred) */}
        <div className="flex border-b border-slate-200 gap-1 sm:gap-2 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('plan')}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'plan'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Recommended Plan ({comparison?.knapsack_strategy?.total_tasks_selected || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('skipped')}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'skipped'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Deferred Findings ({comparison?.knapsack_strategy?.skipped_tasks?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'charts'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Visual Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('backlog')}
            className={`pb-3 px-3 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'backlog'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Full Backlog ({vulnerabilities.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Optimal Remediation Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prioritized sequence calculated by 0/1 Knapsack dynamic programming to maximize cumulative risk reduction.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700">
                Total Allocated Effort: {comparison?.knapsack_strategy?.total_hours_used || 0}h / {availableHours}h
              </span>
            </div>

            <RecommendedPlan
              tasks={comparison?.knapsack_strategy?.selected_tasks || []}
              onMarkComplete={handleToggleStatus}
              onViewFormula={handleOpenFormula}
            />
          </div>
        )}

        {/* Point 4: Deferred Findings */}
        {activeTab === 'skipped' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Deferred Vulnerabilities & Opportunity Cost Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent rationale explaining why specific findings were deferred to maintain overall security posture within budget.
              </p>
            </div>

            <SkippedAnalysis
              skippedTasks={comparison?.knapsack_strategy?.skipped_tasks || []}
              availableHours={availableHours}
              onViewFormula={handleOpenFormula}
            />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Comparative Analytics & Backlog Insights
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual demonstration of mathematical superiority, risk distribution, and budget capacity utilization.
              </p>
            </div>

            <Visualizations
              comparison={comparison}
              summary={metricsSummary}
            />
          </div>
        )}

        {activeTab === 'backlog' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Complete Vulnerability Inventory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Edit remediation effort, inspect transparent risk calculations, track historical variance feedback, or toggle completion.
                </p>
              </div>
              <button
                onClick={() => { setEditingVuln(null); setIsAddModalOpen(true); }}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 cursor-pointer self-start sm:self-auto"
              >
                + Add Custom Finding
              </button>
            </div>

            <VulnerabilityTable
              vulnerabilities={filteredVulns}
              onUpdateHours={handleUpdateHours}
              onToggleStatus={handleToggleStatus}
              onEdit={(vuln) => { setEditingVuln(vuln); setIsAddModalOpen(true); }}
              onDelete={handleDelete}
              onViewFormula={handleOpenFormula}
              onUndoFeedback={handleUndoFeedback}
              onClearFeedback={handleClearFeedback}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <AddEditModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingVuln(null); }}
        onSave={handleSaveFinding}
        editingVuln={editingVuln}
      />

      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          setIsUploadModalOpen(false);
          showToast('CSV uploaded and enriched successfully via NIST NVD, FIRST EPSS & CISA KEV');
          loadAllData();
        }}
      />

      <RiskFormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        selectedVuln={selectedVulnForFormula}
      />

      <CompleteTaskModal
        isOpen={isCompleteModalOpen}
        onClose={() => { setIsCompleteModalOpen(false); setTaskToComplete(null); }}
        task={taskToComplete}
        onConfirm={handleConfirmComplete}
      />
    </div>
  );
}
