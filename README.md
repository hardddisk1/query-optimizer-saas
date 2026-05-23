# ⚡ AI-Driven Database Query Optimizer SaaS

An automated, cross-runtime engineering pipeline that captures slow database queries from a client application, streams them to an AI reasoning framework, and deploys production-ready SQL indexing migrations directly via automated GitHub Pull Requests.

---

## 🏗️ Architecture & Data Flow

[Java Client App] ──(HTTP POST Telemetry)──▶ [Node.js Gateway Server]
                                              │
                                     (Claude Optimization API)
                                              ▼
[GitHub Repository] ◀──(Automated Live PR)─── [Claude AI Engine]

1. Telemetry Capture: The Java client intercepts a heavy or un-indexed query payload (e.g., executing > 500ms) and dispatches it over an encrypted stream.
2. Gateway Ingestion: A Node.js backend cluster ingests the metrics, verifies secure local bearer tokens, and maps out the extraction thread.
3. AI Logic Processing: The SQL data is analyzed by Claude, which generates raw relational index schemas (CREATE INDEX), risk assessments, and semantic performance rationales.
4. DevOps Automation: The server leverages the GitHub REST API to isolate a unique feature branch, push the dynamic physical .sql script, and open a live Pull Request.
5. Real-Time Monitoring: An Angular (v18+) Dashboard utilizes Signals to provide live visualization of all incoming telemetry and automated fix progress.

---

## 📁 System Topology

query-optimizer-saas/
├── backend-node/             # TypeScript Node.js Service
├── client-java/              # Performance Test Client Interceptor
└── frontend-angular/         # Angular (v18+) Monitoring UI (Standalone/Signals)

---

## 🚀 Local Installation & Execution

### 1. Prerequisites
* Hardware: Apple Silicon (MacBook Pro M4 Architecture verified)
* Runtimes: Node.js (v18+) & Java Virtual Machine (JDK 11/17+ compliant)

### 2. Infrastructure Setup & Environment Configuration
Inside the backend-node/ directory, populate a .env file with the following operational variables:

OPTIMIZER_API_KEY=dev-secret-key-123
GITHUB_TOKEN=ghp_yourActualTokenStringHere

### 3. Launching the Orchestration Engine
cd backend-node
npm install
npm run dev

cd ../frontend-angular
npm install
ng serve

*Access the dashboard at http://localhost:4200.*

### 4. Simulating Slow Telemetry
Open the client-java suite inside IntelliJ IDEA. Locate: client-java/src/main/java/TestClientApp.java. Execute the runtime thread using the Green Play Button.

---

## 📊 Verification Metrics

Upon clicking play in your Java IDE, the Node service will dump the following live pipeline stream confirming execution status:

==================================================
⚠️ [SLOW QUERY INGESTED] Execution Time: 745.00ms
📜 Raw SQL: SELECT company_id, SUM(revenue) FROM billing_reports GROUP BY company_id HAVING SUM(revenue) > 500000;
==================================================
🤖 Contacting Claude Tuning Engine for optimization strategies...
✨ [CLAUDE OPTIMIZATION GENERATED]
🛠️ Proposed Fix: CREATE INDEX idx_billing_reports_company_revenue ON billing_reports(company_id, revenue);
📊 Risk Index: LOW
==================================================
🐙 Dispatching automated Pull Request loop...
--- 🐙 Live PR Dispatch Verification ---
Token Runtime Status: LOADED ✅
---------------------------------------
🌿 Creating new Git branch: optimize/db-index-1779496714218...
💾 Writing migration file: migrations/add_performance_index.sql...
🚀 Shipping automated Pull Request to hardddisk1/query-optimizer-saas...
🎉 SUCCESS: Pull Request deployed live!
🔗 Link: https://github.com/hardddisk1/query-optimizer-saas/pull/1
==================================================


