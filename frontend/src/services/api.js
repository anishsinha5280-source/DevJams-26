const API_BASE = '/api';

export async function fetchVulnerabilities(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.severity) query.append('severity', params.severity);
  if (params.search) query.append('search', params.search);
  
  const res = await fetch(`${API_BASE}/vulnerabilities?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch vulnerabilities');
  return res.json();
}

export async function fetchMetricsSummary() {
  const res = await fetch(`${API_BASE}/vulnerabilities/metrics/summary`);
  if (!res.ok) throw new Error('Failed to fetch metrics summary');
  return res.json();
}

export async function runOptimization(payload) {
  const res = await fetch(`${API_BASE}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to run optimization');
  }
  return res.json();
}

export async function loadDemoData() {
  const res = await fetch(`${API_BASE}/demo/load`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to load demo data');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

export async function createVulnerability(data) {
  const res = await fetch(`${API_BASE}/vulnerabilities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create vulnerability');
  }
  return res.json();
}

export async function updateVulnerability(id, data) {
  const res = await fetch(`${API_BASE}/vulnerabilities/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update vulnerability');
  }
  return res.json();
}

export async function deleteVulnerability(id) {
  const res = await fetch(`${API_BASE}/vulnerabilities/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete vulnerability');
  return res.json();
}

export async function undoFeedback(id) {
  const res = await fetch(`${API_BASE}/vulnerabilities/${encodeURIComponent(id)}/feedback/latest`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to undo feedback');
  }
  return res.json();
}

export async function clearFeedback(id) {
  const res = await fetch(`${API_BASE}/vulnerabilities/${encodeURIComponent(id)}/feedback`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to clear feedback');
  }
  return res.json();
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/vulnerabilities/upload-csv`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload CSV');
  }
  return res.json();
}
