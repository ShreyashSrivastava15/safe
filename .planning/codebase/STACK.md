# Technology Stack

## Core Languages & Runtimes
- **TypeScript**: Primary language for Frontend and Backend Gateway.
- **Python (3.11+)**: Powering the AI/ML Inference Service.
- **Node.js (18+)**: Runtime for the API Gateway.
- **SQL**: Database querying and schema definition.

## Frontend (React)
- **Framework**: React 18 with Vite as the build tool.
- **Styling**: Tailwind CSS for utility-first styling.
- **UI Components**: Radix UI primitives via Shadcn UI.
- **State Management**: TanStack Query (React Query) for server state.
- **Routing**: React Router DOM v6.
- **Icons**: Lucide React.
- **Form Handling**: React Hook Form with Zod validation.

## Backend (Node.js Gateway)
- **Framework**: Express.js.
- **ORM**: Prisma (connected to Supabase/PostgreSQL).
- **Execution**: `tsx` for running TypeScript directly.
- **Security**: Helmet, express-rate-limit, bcryptjs, jsonwebtoken.

## AI Service (Python)
- **Framework**: FastAPI / Uvicorn.
- **ML Libraries**: 
  - **Transformers (HuggingFace)**: RoBERTa for NLP analysis.
  - **Scikit-learn**: Isolation Forest for transaction anomaly detection.
- **Validation**: Pydantic.

## Database & Infrastructure
- **Primary Database**: Supabase (PostgreSQL).
- **Caching/Local DB**: SQLite (indicated in Prisma schema for certain environments).
- **Deployment**:
  - **Vercel**: Frontend hosting.
  - **Render**: AI Service hosting.
  - **Docker**: Containerization for consistent environments.
- **Version Control**: Git / GitHub.

## Browser Extension
- **Platform**: Manifest V3.
- **Logic**: Vanilla JavaScript for lightweight real-time monitoring.
