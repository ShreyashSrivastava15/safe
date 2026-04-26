# S.A.F.E. (Scam Analysis & Fraud Elimination)

## What This Is

S.A.F.E. is a comprehensive fraud detection platform designed to protect users from modern scams. It utilizes a multi-modal approach, analyzing communication content (emails, SMS), URLs, and transactional data in real-time to identify and flag potential threats before they cause harm.

## Core Value

Providing a single, accurate "risk score" by aggregating signals across multiple vectors (NLP, URL analysis, and Transaction heuristics).

## Requirements

### Validated

- ✓ Multi-modal risk engine architecture — Phase 1
- ✓ Python AI Inference Service (FastAPI) — Phase 1
- ✓ Node.js Backend with Express — Phase 1
- ✓ Frontend React/Vite UI with premium design — Phase 1

### Active

- [ ] Real-time Gmail/SMS monitoring integration
- [ ] Automated user notification system
- [ ] Admin dashboard for fraud pattern analysis

### Out of Scope

- [Direct Action] — The system flags and warns; it does not block transactions or delete emails automatically (prevents false-positive disruption).

## Context

- **AI Service**: Python FastAPI service running heuristic and scikit-learn models.
- **Backend**: Node.js/Express service coordinating between the frontend, AI service, and database.
- **Frontend**: React/Vite/TypeScript with shadcn/ui.
- **Current State**: System is functional but currently blocked by a database connection failure.

## Constraints

- **Tech Stack**: Must use TypeScript/React/Node.js/Python.
- **Privacy**: Must handle sensitive user communication data securely.
- **Pivoting**: Moving away from Supabase as the primary backend-as-a-service.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-modal Analysis | Scams often span multiple vectors (e.g., a suspicious email with a malicious URL). | ✓ Good |
| Heuristic Fallback | AI models can fail or timeout; system must remain functional. | ✓ Good |
| Remove Supabase | User preference to move away from Supabase infrastructure. | — Pending |

---
*Last updated: 2026-04-24 after initial project health audit and user pivot request*
