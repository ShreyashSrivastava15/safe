# System Architecture

## High-Level Overview
S.A.F.E. follows an **Orchestrated Microservices Architecture**. It separates the user interface, the API orchestration layer, and the specialized AI inference layer.

## Component Breakdown

### 1. Frontend (React SPA)
- Provides the Dashboard for manual submission and visualization of fraud signals.
- Interfaces with the Node.js Gateway.

### 2. Node.js API Gateway (Orchestrator)
- **Role**: Validates requests, manages authentication, and orchestrates analysis.
- **Workflow**:
  - Receives analysis request.
  - Parallelizes calls to the Python AI service engines.
  - Aggregates results using a **Weighted Fusion** algorithm (`riskEngine.ts`).
  - Persists analysis logs to Supabase.
  - Returns a unified risk score and human-readable signals.

### 3. AI Inference Service (FastAPI)
- **Role**: High-performance ML inference.
- **Engines**:
  - **Comm Engine**: RoBERTa-based NLP for phishing/spam.
  - **URL Engine**: Intelligence-based scoring (WHOIS, Entropy, TLD).
  - **Job Engine**: Pattern detection for recruitment fraud.
  - **SocEng Engine**: Psychological trigger analysis (Fear, Greed, Urgency).
  - **TX Engine**: Isolation Forest for transaction behavioral anomaly detection.

### 4. Browser Extension
- Performs real-time content scraping and background analysis.
- Alerts users to detected risks without requiring the Dashboard.

## Data Flow
1. **Request**: User/Extension -> Node Gateway (`POST /api/v1/analyze`).
2. **Parallel Analysis**: Node Gateway -> AI Service Engines (NLP, URL, TX, etc.).
3. **Synthesis**: Engines return individual scores -> Node Gateway `riskEngine` calculates `final_score`.
4. **Persistence**: Gateway writes to `analysis_logs` table in Supabase.
5. **Response**: Gateway returns detailed JSON including signals and explanation.

## Security Model
- **Rate Limiting**: Applied at the Gateway level to prevent abuse.
- **Encryption**: JWT for sessions, bcrypt for password hashing.
- **Least Privilege**: Scoped Google OAuth tokens stored securely.
