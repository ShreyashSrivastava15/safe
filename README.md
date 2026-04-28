# S.A.F.E. (Scam Analysis and Fraud Elimination)
# S.A.F.E. (Scam Analysis and Fraud Elimination)

> **Production-Grade, ML-Assisted Fraud Detection System**
> A multi-modal cybersecurity solution integrating Transformers, Isolation Forests, and advanced heuristics to detect fraud across 5 distinct vectors in real-time.

---

## 🚀 How to Run

### **Prerequisites**
- Node.js (v18+)
- Python (3.11+)
- PostgreSQL Database
- Google Cloud Credentials (for Real-time monitoring)

### **Quick Start**

1. **Setup Python AI Service**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python main.py
   ```

2. **Setup Node.js Gateway**
   ```bash
   npm install
   npx prisma migrate dev
   npm run server
   ```

---

## 🏗️ System Architecture

### **High-Level Flow**
1. **Input**: User submits content via Dashboard, or **Real-time Webhooks** trigger an analysis for new emails.
2. **Orchestration**: `Node.js API Gateway` validates the request and parallelizes analysis across 5 AI engines.
3. **AI Inference (FastAPI)**:
   - **Comm Engine**: RoBERTa-based NLP for phishing & spam.
   - **URL Engine**: Intelligence-based scoring (WHOIS, Entropy, TLD).
   - **Job Engine**: Pattern detection for recruitment fraud.
   - **SocEng Engine**: Psychological trigger analysis (fear, greed).
   - **TX Engine**: Isolation Forest for behavioral anomaly detection.
4. **Weighted Fusion**: `riskEngine.ts` aggregates scores into a **Unified Risk Score** using configurable weights.
5. **Persistence**: Results are logged to **PostgreSQL (via Prisma)** with detailed signals and findings.
6. **Real-time Alerts**: Critical threats trigger **SSE (Server-Sent Events)** notifications to the user's dashboard.

---

## 📡 API Specification

### **Analyze Risk**
`POST /api/v1/analyze`

**Request Body**:
```json
{
  "message": "URGENT: Verify your account...",
  "url": "http://suspicious-bank.xyz",
  "transaction": {
    "amount": 50000,
    "velocity": 5,
    "geo_shift": true
  },
  "fraud_type": "email"
}
```

### **Real-time Monitoring**
- `POST /api/v1/gmail/watch`: Enables push notifications for the user's inbox.
- `GET /api/v1/notifications/stream`: SSE endpoint for live threat alerts.

---

## 🛡️ Reliability & Hardening
- **Fault Tolerance**: Automatic retries and circuit-breaking timeouts for AI engine calls.
- **Reputation Layer**: Cryptographic verification (DKIM/SPF) for high-reputation domains.
- **Explainability**: Mandatory human-readable signals for all suspicious findings.
- **Accessibility**: Screen-reader friendly UI components for critical risk gauges.

---

## Local Development (No Docker)

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL installed locally (default port 5432)

### One-time setup
1. Create a database named `safe_db` in your local PostgreSQL
2. Update `.env` → `DATABASE_URL` with your postgres credentials
3. Run: `powershell -ExecutionPolicy Bypass -File scripts/setup.ps1`

### Start all services
npm run dev:all

Services will be available at:
- Frontend: http://localhost:8081
- Backend API: http://localhost:3001
- AI Service: http://localhost:8000

---

## 🏗️ System Architecture

```
/
├── src/                # Frontend (React + Vite + Tailwind)
├── server/             # Node.js Gateway & Orchestration
│   ├── routes/         # Versioned API Endpoints
│   ├── services/       # Risk Fusion & AI Proxy
│   └── config/         # Scoring weights & Thresholds
├── ai-service/         # Python Inference Layer (FastAPI)
│   ├── engines/        # Modular ML Engines
│   └── models/         # Pre-trained model cache
└── prisma/             # Database Schema & Migrations
```

 
 - - 
 * L a s t   V e r i f i e d   f o r   P r o d u c t i o n   R e a d i n e s s :   2 0 2 6 - 0 4 - 2 3   b y   A n t i g r a v i t y   A I *