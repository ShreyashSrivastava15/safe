# Phase 4 Plan: Real-time Integration & Final Hardening

## Goal
Complete the S.A.F.E. platform by integrating real-time Gmail monitoring, fixing existing security/logic gaps, and ensuring production readiness.

## Requirements
- Address all Critical/High findings from [03-REVIEW.md](file:///d:/safe/.planning/phases/03-elite-ui-intelligence/03-REVIEW.md).
- Implement real-time Gmail inbox monitoring (Push notifications).
- Build a user notification system for instant threat alerts.
- Finalize the Admin Dashboard with system-wide metrics.

## Proposed Changes

### 1. Hardening & Review Fixes (Gaps)
- **`riskEngine.ts`**: Standardize `AnalysisMetadata` interface and improve domain extraction.
- **`transactionService.ts`**: Integrate `callAiEngine` to use ML scores alongside heuristics.
- **`config/risk.ts`**: Externalize engine weights and thresholds.
- **`RiskScoreGauge.tsx`**: Add ARIA roles and labels for accessibility.

### 2. Real-time Gmail Monitoring
- **`server/routes/gmail.ts`**:
    - Add `POST /webhook/gmail` to receive Google Cloud Push notifications.
    - Implement `setupWatch()` function to initialize `gmail.users.watch`.
    - Implement background processing for new messages triggered by webhooks.
- **`server/services/notificationService.ts`**:
    - Create a simple service to manage real-time alerts (via Server-Sent Events or WebSockets).

### 3. User Experience & Dashboard
- **Frontend**:
    - Add a "Notification Toast" or "Alert Center" for real-time detections.
    - Update `Dashboard.tsx` to include aggregate metrics (Detection Velocity, System Health).
- **Extension**:
    - Ensure background script correctly communicates with the new real-time endpoints.

## Execution Steps
1. **[Fix]** Address review findings in `riskEngine.ts` and `transactionService.ts`.
2. **[Config]** Create `server/config/riskConfig.ts` and migrate hardcoded values.
3. **[Real-time]** Implement Gmail Webhook endpoint and `watch` logic.
4. **[UI]** Update Gauge accessibility and add notification UI to dashboard.
5. **[Verification]** Perform end-to-end UAT with a mock Gmail message.

## Verification Loop
- **Unit**: Verify `riskEngine` still produces correct scores with new weights.
- **Integration**: Verify `analyzeTransaction` successfully calls the AI service.
- **E2E**: Simulate a Gmail webhook and verify a notification appears on the dashboard.
