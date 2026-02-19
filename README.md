# S.A.F.E. (Scam Analysis and Fraud Elimination)

> **Production-Grade, ML-Assisted Fraud Detection System**
> A multi-modal cybersecurity solution integrating Transformers, Isolation Forests, and advanced heuristics to detect fraud across 5 distinct vectors in real-time.

---

## 🚀 How to Run

### **Prerequisites**
- Node.js (v18+)
- Python (3.11+)
- Supabase Account (Credentials in `.env`)

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
   npm run server
   ```

---

## 🏗️ System Architecture

### **High-Level Flow**
1. **Input**: User submits suspicious content (Text, URL, or Transaction) via the Dashboard.
2. **Orchestration**: `Node.js API Gateway` validates the request and parallelizes analysis across 5 AI engines.
3. **AI Inference (FastAPI)**:
   - **Comm Engine**: RoBERTa-based NLP for phishing & spam.
   - **URL Engine**: Intelligence-based scoring (WHOIS, Entropy, TLD).
   - **Job Engine**: Pattern detection for recruitment fraud.
   - **SocEng Engine**: Psychological trigger analysis (fear, greed).
   - **TX Engine**: Isolation Forest for behavioral anomaly detection.
4. **Weighted Fusion**: `riskEngine.ts` aggregates scores into a **Unified Risk Score**.
5. **Persistence**: Results are logged to **Supabase** with detailed signals and latencies.

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
  }
}
```

**Response**:
```json
{
  "scores": {
    "nlp": 0.99,
    "url": 0.85,
    "transaction": 0.72,
    "job_offer": 0.1,
    "social_engineering": 0.88
  },
  "signals": ["[Comm] Urgent language", "[URL] Suspicious TLD", "[SocEng] Fear trigger"],
  "final_score": 0.82,
  "risk_level": "FRAUD",
  "explanation": "S.A.F.E. Analysis Summary: [Comm] Urgent language; [URL] Suspicious TLD; [SocEng] Fear trigger."
}
```

---

## 🛡️ Reliability & Hardening
- **Fault Tolerance**: Automatic retries and circuit-breaking timeouts for AI engine calls.
- **Explainability**: Mandatory human-readable signals for all suspicious findings.
- **Performance**: High-concurrency processing with cached ML model weights.

---

---

## 🔮 Future Scope (Out of Scope)
The following features are currently out of scope and planned for future iterations:
- **SIM Swap Detection**: Behavioral monitoring of carrier-side changes.
- **ATM Skimming Analysis**: Heuristic modeling for physical terminal fraud.
- **Deepfake Biometric Analysis**: Advanced video/audio authentication.
- **Voice-based Vishing Detection**: Real-time acoustic analysis for phishing calls.

---

## 📂 Project Structure

```
/
├── src/                # Frontend (React)
├── server/             # Node.js Gateway & Orchestration
│   ├── services/       # Proxy logic & Risk Fusion
│   └── utils/          # AI Service Client
├── ai-service/         # Python Inference Layer (FastAPI)
│   ├── engines/        # Modular ML/Heuristic Engines
│   └── models/         # Pre-trained model cache
└── supabase/           # Database Config
```
