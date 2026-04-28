# Project Structure

```text
/
├── .planning/           # GSD Framework files (Roadmap, States, Codebase Map)
├── ai-service/          # Python Inference Layer (FastAPI)
│   ├── engines/         # Modular ML/Heuristic Engines (NLP, URL, TX, etc.)
│   ├── models/          # Cached ML model weights (RoBERTa, Isolation Forest)
│   ├── tests/           # Python unit tests for engines
│   └── main.py          # FastAPI entry point
├── server/              # Node.js API Gateway & Orchestrator
│   ├── routes/          # Express route definitions (/api/v1/analyze)
│   ├── services/        # Business logic (Risk Fusion, Google API client)
│   ├── middleware/      # Auth, Rate Limiting, Error handling
│   ├── utils/           # AI Service Proxy client
│   └── index.ts         # Gateway entry point
├── src/                 # Frontend React Application
│   ├── components/      # UI components (Shadcn/UI, Layouts)
│   ├── pages/           # View-level components (Dashboard, History)
│   ├── hooks/           # Custom React hooks (useAnalysis, useAuth)
│   ├── services/        # API communication layer
│   ├── integrations/    # External service bindings (Supabase)
│   └── main.tsx         # React entry point
├── extension/           # Browser Extension (Chrome/Edge)
│   ├── manifest.json    # Extension configuration
│   ├── content.js       # Page scraping logic
│   └── popup.js/html    # Extension UI
├── prisma/              # Database modeling
│   └── schema.prisma    # Prisma schema definition
├── supabase/            # Database configuration and migrations
└── public/              # Static assets
```

## Key Files
- `server/services/riskEngine.ts`: Core logic for weighted score fusion.
- `ai-service/main.py`: Main router for AI engine orchestration.
- `prisma/schema.prisma`: Source of truth for the database structure.
- `package.json`: Main dependency and script manifest.
- `README.md`: High-level system overview and setup instructions.
