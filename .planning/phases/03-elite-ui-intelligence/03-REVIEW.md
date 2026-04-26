# Code Review: Phase 3 (Elite UI/UX & Forensic Intelligence)

## Summary
- **Phase**: 3
- **Review Date**: 2026-04-24
- **Reviewer**: Antigravity (Elite Reviewer)
- **Status**: 🟡 REQUIRES FIXES

## Findings Overview
| ID | File | Finding | Severity |
|----|------|---------|----------|
| SEC-01 | `transactionService.ts` | Hardcoded historical average (500) for deviation check | 🟡 WARNING |
| ARCH-01| `analyze.ts` | Lack of transaction sub-schema validation for velocity | 🔴 CRITICAL |
| UI-01 | `AnalyzeView.tsx` | Missing loading states for Gmail sync carousel | 🔵 INFO |
| DATA-01| `schema.prisma` | Optional fields in AnalysisLog missing default empty JSON | 🟡 WARNING |

## Detailed Findings

### [SEC-01] Hardcoded Transaction Baseline
- **File**: `server/services/transactionService.ts`
- **Logic**: `const userAvg = transaction.user_avg_amount || 500;`
- **Issue**: Relying on a fallback constant for fraud detection reduces accuracy for premium users.
- **Recommendation**: Ensure `user_avg_amount` is always passed from the user profile service.

### [ARCH-01] Missing Velocity Type Validation
- **File**: `server/routes/analyze.ts`
- **Issue**: The Zod schema validates `velocity` as an optional number but doesn't enforce positive integers.
- **Recommendation**: Update Zod schema to `.int().positive()`.

### [DATA-01] JSON Field Initialization
- **File**: `prisma/schema.prisma`
- **Issue**: `findings_json` can be null, leading to runtime errors on the frontend if not handled.
- **Recommendation**: Set `@default("[]")` for findings and signals.

---
## Next Steps
1. Run `/gsd-code-review-fix 3` to apply recommended architectural and data fixes.
2. Re-verify the "Impossible Travel" logic with dynamic input.
