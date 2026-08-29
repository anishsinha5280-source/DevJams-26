# Cybersecurity Risk Prioritization System

**Built for [DevJams'26](https://devjams.dscvit.com/), GDG on Campus VIT Vellore.**

**Team:**
- Samyak Jain
- Mithul Ram Sundaresan
- Anish Somnath Sinha
- Samarth Sohane

**Track:** Open Innovation

**Cybersecurity Risk Prioritization System** is an end-to-end web application designed for IT security teams, DevSecOps engineers, and SMBs operating under strict remediation time budgets (e.g., 5.0 hours/week). 

Instead of traditional top-down greedy ordering (which blindly consumes the entire time budget on massive, low-efficiency patches), this system implements a **0/1 Knapsack Dynamic Programming Optimizer** to identify the exact combination of remediation actions that maximizes global risk reduction within the user's available time constraints.

---

## Prerequisites

- Python 3.11+
- Node.js 18+

---

## Key Features

1. **0/1 Knapsack Dynamic Programming Engine**:
   - Solves the constrained discrete optimization problem: $\max \sum \text{Risk Reduction}_i$ subject to $\sum \text{Time Required}_i \le \text{Available Hours}$.
   - Outperforms conventional top-down ranking by balancing high-efficiency quick-fixes against heavy patches.

2. **Deterministic, Explainable Risk Model**:
   - Transparent formula: 
     $$\text{Risk} = \text{Base Severity} \times \text{Exploit Factor} \times \text{Asset Criticality Factor}$$
   - Where $\text{Base Severity} = \text{CVSS} \times 10.0$
   - $\text{Exploit Factor} = (1.0 + \text{EPSS} \times 1.5) \times (2.0 \text{ if CISA KEV active else } 1.0)$
   - $\text{Asset Criticality} \in \{\text{Critical: } 2.5\times, \text{High: } 1.8\times, \text{Medium: } 1.2\times, \text{Low: } 1.0\times\}$

3. **Deterministic Opportunity Cost Explainability Engine**:
   - Explicitly explains *why* tasks were selected (risk density in risk/hr, contribution to total reduction).
   - Generates transparent trade-off analyses for skipped high-severity findings (demonstrating why allocating hours to multiple smaller items yielded greater aggregate risk reduction).

4. **Realistic Demo Dataset**:
   - Pre-loaded with 20 real CVEs (including XZ Utils backdoor, Outlook Moniker RCE, Windows RDLsvc, WebKit Zero-Day, PAN-OS command injection, runc breakout, etc.).
   - Benchmark structured so that at a 5.0-hour budget, the 0/1 Knapsack optimizer delivers superior risk reduction compared to traditional greedy selection.

5. **Historical Variance Feedback Loop**:
   - Tracks actual vs. estimated hours upon task completion to dynamically refine future remediation time estimates.

6. **Interactive Visualizations & Backlog Management**:
   - Side-by-side strategy comparison cards and risk reduction charts.
   - Backlog table with search, severity filtering, status toggles, inline hours editing, and CSV upload/export.

---

## Project Structure

```
DevJams/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── vulnerabilities.py   # CRUD, CSV upload, summary metrics
│   │   │   ├── optimize.py          # 0/1 Knapsack & comparison endpoint
│   │   │   └── demo.py              # Demo dataset seeding & reset
│   │   ├── services/
│   │   │   ├── risk_calculator.py   # Transparent deterministic formula
│   │   │   ├── optimizer.py         # 0/1 Knapsack DP & greedy baseline
│   │   │   ├── explainability.py    # Opportunity cost generator
│   │   │   ├── historical_service.py# Historical variance learning
│   │   │   └── csv_handler.py       # CSV validation & parsing
│   │   ├── config.py
│   │   ├── database.py              # SQLite connection & schema init
│   │   ├── main.py                  # FastAPI app & CORS configuration
│   │   ├── schemas.py               # Pydantic data schemas
│   │   ├── seed_data.py             # 20 CVE benchmark dataset
│   │   └── seed_history.py          # Historical variance seed data
│   ├── tests/
│   │   ├── test_risk_calculator.py  # Formula & multiplier unit tests
│   │   ├── test_optimizer.py        # Knapsack correctness & edge cases
│   │   ├── test_csv_handler.py      # CSV validation & malformed row tests
│   │   └── test_api.py              # End-to-end FastAPI endpoint tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── MetricsOverview.jsx
│   │   │   ├── TimeBudgetControl.jsx
│   │   │   ├── StrategyComparison.jsx
│   │   │   ├── RecommendedPlan.jsx
│   │   │   ├── SkippedAnalysis.jsx
│   │   │   ├── Visualizations.jsx
│   │   │   ├── VulnerabilityTable.jsx
│   │   │   ├── AddEditModal.jsx
│   │   │   ├── CsvUploadModal.jsx
│   │   │   ├── RiskFormulaModal.jsx
│   │   │   └── CompleteTaskModal.jsx
│   │   ├── services/
│   │   │   └── api.js               # Frontend API client
│   │   ├── App.jsx                  # Main application orchestrator
│   │   ├── index.css                # Tailwind CSS styling & light theme
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── pytest.ini
└── README.md
```
## How to Run the Application

### 1. Start the Backend (FastAPI)

```bash
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
*API documentation is available at: `http://127.0.0.1:8000/docs`*

### 2. Start the Frontend (Vite React)

In a separate terminal:
```bash
cd frontend
npm run dev
```
*Frontend interface is available at: `http://localhost:5173`*

---

## Running the Test Suite

Run the full automated unit and integration test suite:

```bash
python -m pytest backend/tests -v
```

All 15 test cases verify risk calculations, CISA KEV multipliers, 0/1 knapsack optimality over greedy sorting, edge cases (zero hours, empty dataset, all fit, none fit), CSV parsing validation, and FastAPI endpoints.