# S.A.F.E. Testing Guide

This guide explains how to test all 12 fraud detection categories implemented in the S.A.F.E. (Scam Analysis and Fraud Elimination) platform.

## 🚀 Automated Testing (Recommended)

I have created a comprehensive test suite that benchmarks all fraud categories.

### Run Comprehensive Benchmark
This script will execute 12 unique test cases covering everything from **CEO Impersonation** to **Crypto Giveaways**.

```bash
# Run the benchmark script
npx tsx test-all-scams.ts
```

---

## 🖥️ Manual Testing (via UI)

Navigate to the **Analyze** page in your browser ([http://localhost:8081/analyze](http://localhost:8081/analyze)) and use the following inputs to test specific engines:

### 1. Communication & NLP Testing
*   **Input**: "URGENT: Your account has been locked due to suspicious activity. Verify now: http://fake-bank.top"
*   **Look for**: `[Comm] Urgent/Time-pressure language detected` and `[Comm] Financial intent detected`.

### 2. URL Intelligence Testing
*   **Input URL**: `http://paypaI-secure.xyz` (Note the capital 'I' instead of 'l')
*   **Look for**: `[URL] URL contains potentially deceptive characters` and `[URL] Suspicious TLD`.

### 3. Job & Offer Fraud
*   **Input**: "Great news! You are hired for the remote project manager role. Please pay $50 for the mandatory background check equipment fee."
*   **Look for**: `[Job] Financial request detected in recruitment context`.

### 4. Transaction Anomaly Detection
*   **Amount**: `50000`
*   **Country**: `NG` (or any different from your default)
*   **Look for**: `[TX] Unusual transaction amount` and behavioral signals in the result cards.

### 5. Social Engineering
*   **Input**: "Congratulations! You won the billionaire lottery. Send your ID card copy to claim the prize of $10,000,000."
*   **Look for**: `Greed-based psychological trigger detected (Reward)`.

---

## 🛠️ Testing Internal AI Logic

If you want to see how the Python AI engines handle data directly, you can test the **AI Inference Service** locally:

### Health Check (FastAPI)
```bash
curl http://localhost:8000/health
```

### Direct Engine Test (Communication)
```bash
curl.exe -X POST http://localhost:8000/analyze/communication -H "Content-Type: application/json" -d "{\"content\": \"Limited time offer: Get free Bitcoin now!\"}"
```

---

## 📊 Expected Results
*   **High Risk (RED)**: For inputs with clear malicious intent (e.g., lottery + suspicious URL).
*   **Suspicious (YELLOW)**: For inputs with some triggers (e.g., job offer asking for personal info but no link).
*   **Safe (GREEN)**: For benign, casual messages.

> **Note**: For the best experience, ensure all three services are running: **AI Service** (Python), **API Gateway** (Node.js), and **Frontend** (Vite).
