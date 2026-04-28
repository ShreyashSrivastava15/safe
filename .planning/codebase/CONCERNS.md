# Known Concerns & Technical Debt

## Performance & Latency
- **Engine Latency**: Parallel analysis across 5 AI engines is bottlenecked by the slowest engine (likely the Transformer-based NLP engine).
- **Cold Starts**: If hosted on serverless/scaled-to-zero platforms (like Render Free Tier), the initial analysis can take >30 seconds.

## Machine Learning
- **Model Drift**: AI engines rely on static weights in `ai-service/models/`. There is currently no pipeline for automated retraining or drift detection.
- **False Positives**: The reputation layer (TrustedSource) is basic and may require more granular whitelist management to avoid flagging official domains.

## Security
- **OAuth Scopes**: Google OAuth currently requests high-privilege scopes for Gmail monitoring. These should be audited and minimized.
- **Secret Management**: Dependency on `.env` files for Supabase and Google credentials; need to ensure secrets are managed via platform-specific secret managers in production.

## Scalability
- **Supabase Connections**: As concurrency increases, the Node.js Gateway might hit connection limits for the PostgreSQL instance.
- **In-Memory Models**: Loading multiple Transformer models into memory in `ai-service` requires significant RAM (>= 2GB), limiting deployment on low-spec instances.

## Technical Debt
- **SQLite vs Postgres**: Prisma schema currently references SQLite, while production uses Supabase (Postgres). This discrepancy should be resolved to ensure parity across environments.
- **Test Coverage**: While engines are tested, the overall integration test coverage for edge-case fraud patterns is relatively low.
