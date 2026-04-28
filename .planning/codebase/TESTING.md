# Testing Strategy

## Frameworks
- **Vitest**: Primary runner for Frontend and Node.js unit/integration tests.
- **Pytest**: Used for testing Python AI engines.

## Test Types

### 1. Unit Tests
- **AI Engines**: Each engine in `ai-service/engines/` has corresponding tests in `ai-service/tests/` to verify scoring logic against known samples.
- **Utils/Hooks**: Core utilities and custom hooks are tested in isolation.

### 2. Integration Tests
- **API Endpoints**: Testing the full request-response cycle from Gateway to AI Service and back.
- **Risk Fusion**: Verifying that `riskEngine.ts` correctly aggregates scores from multiple engines.

### 3. End-to-End (E2E)
- **Dashboard Flows**: High-level tests for submission and result display.
- **Extension Hooks**: Verifying the extension correctly triggers analysis.

## Test Artifacts
- `test_output.txt`: Log of recent test executions and results.
- `test-analyze.ts`: Script for ad-hoc analysis testing.
- `RELEASE_CERTIFICATION.md`: Documentation of production-readiness verification.

## Running Tests
- Frontend: `npm run test` (if configured).
- Backend: `npm run test:server` (if configured).
- AI Service: `cd ai-service && pytest`.
