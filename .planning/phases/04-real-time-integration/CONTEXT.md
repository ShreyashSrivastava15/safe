# Phase 4 Context: Real-time Integration

## Status
- **Current Progress**: ~75%
- **Current Phase**: Phase 4 (Integration & Hardening)
- **Primary Objective**: Make the system "Done and Completed".

## Key Files
- `server/services/riskEngine.ts`: Core orchestrator.
- `server/services/transactionService.ts`: TX engine.
- `server/routes/gmail.ts`: Gmail interface.
- `src/pages/Dashboard.tsx`: Main user console.

## Constraints
- Must use existing `googleapis` for Gmail.
- Must preserve premium "Elite UI" aesthetics.
- Must ensure ML models are fully utilized (no heuristic bypass).

## Assumptions
- User has a Google Cloud Project set up with Gmail API enabled.
- `.env` contains `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- The `ai-service` is running and accessible to the gateway.
