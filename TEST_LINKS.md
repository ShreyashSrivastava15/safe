# S.A.F.E. Test Scenarios (Tiered Levels)

This document contains test cases categorized by their risk levels: **SAFE**, **SUSPICIOUS**, and **FRAUDULENT**.

---

## 📧 1. Email & Communication Risk
| Level | Payload (Message) | Expected Result |
| :--- | :--- | :--- |
| **SAFE** | "Hey, are we still meeting for coffee at 5 PM today? Let me know." | **0-15% (Safe)** |
| **SUSPICIOUS** | "Hi, I'm from tech support. We noticed an issue with your account. Please reply 'YES' to start a diagnostic." | **40-60% (Suspicious)** |
| **FRAUDULENT** | "URGENT: Your account will be locked in 1 hour. Process this $12,500 wire transfer immediately to prevent permanent loss." | **85-99% (Fraud)** |

---

## 🔗 2. Malicious URL Intelligence
| Level | Payload (URL) | Expected Result |
| :--- | :--- | :--- |
| **SAFE** | `https://www.wikipedia.org` | **0-10% (Safe)** |
| **SUSPICIOUS** | `http://secure-login-portal-2026.com/verify` | **45-65% (Suspicious)** |
| **FRAUDULENT** | `http://paypaI-security-verify.xyz/dashboard` | **90-99% (Fraud)** |

---

## 💰 3. Financial Fraud Analysis
| Level | Amount / Country | Expected Result |
| :--- | :--- | :--- |
| **SAFE** | `$120` / `US` (Normal Transaction) | **0-10% (Safe)** |
| **SUSPICIOUS** | `$4,500` / `KY` (Unusual Location) | **40-65% (Suspicious)** |
| **FRAUDULENT** | `$55,000` / `NG` (High Value + High Risk Geo) | **85-99% (Fraud)** |

---

## 🛒 4. E-commerce Scam Scanner
| Level | Message + URL | Expected Result |
| :--- | :--- | :--- |
| **SAFE** | "Check out these shoes on Amazon" + `https://amazon.com` | **0-15% (Safe)** |
| **SUSPICIOUS** | "Clearance sale on sneakers" + `http://sneaker-outlet-deals.net` | **45-65% (Suspicious)** |
| **FRAUDULENT** | "FLASHSALE: iPhone 15 only $199! Last 5 units!" + `http://cheap-iphone.shop` | **90-99% (Fraud)** |

---

### 🛠️ Execution Guide
1. Open the **Analyze** section on http://127.0.0.1:8081.
2. Ensure both the **Node.js** and **AI Service** are running in your terminal.
3. Paste the payloads above to verify the tiered detection logic.
