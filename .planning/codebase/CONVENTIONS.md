# Coding Conventions

## General Standards
- **TypeScript First**: All Node.js and React code must be typed. Avoid `any`.
- **ES Modules**: Use `import/export` syntax across all environments (Node, React, Python).
- **Asynchronous Patterns**: Use `async/await` for all I/O and network operations.

## Backend (Node.js & Python)
- **Controller/Service Pattern**: Logic should reside in services, while routes/controllers handle HTTP concerns.
- **RESTful API**: Versioned endpoints starting with `/api/v1/`.
- **Pydantic Models**: Used in Python for strict request/response validation.
- **Error Handling**: Standardized JSON error responses with status codes.

## Frontend (React)
- **Functional Components**: Use Arrow functions for components.
- **Hook-based Logic**: Extract complex state or side effects into custom hooks.
- **Shadcn UI**: Follow the pattern of placing atomic UI components in `@/components/ui`.
- **Component Placement**: 
  - `pages/`: Full screen views.
  - `components/`: Reusable fragments.
- **File Naming**: 
  - `PascalCase` for React components (`Dashboard.tsx`).
  - `camelCase` for utilities and hooks (`useAuth.ts`).

## Database
- **Migrations**: Always use `prisma migrate` or Supabase CLI to update the schema.
- **Model Naming**: `Snake_case` for table names in DB, `PascalCase` for Prisma models.

## Git & Commits
- **Atomic Commits**: Small, focused commits covering single features or fixes.
- **Workflow**: GSD-standardized commit messages (e.g., `gsd-execute-phase: ...`).
