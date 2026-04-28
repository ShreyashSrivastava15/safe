# External Integrations

## Authentication & Identity
- **Google OAuth 2.0**: Used for user authentication and Gmail monitoring permissions.
- **JWT (JSON Web Tokens)**: Secure stateless authentication between client and server.

## Database & Storage
- **Supabase**: 
  - **PostgreSQL**: Primary data persistence for analysis logs and user data.
  - **Auth**: Potentially integrated with Supabase Auth.
  - **Storage**: Used for assets or scan results if needed.

## AI Engines & Services
- **HuggingFace**: Source for RoBERTa models used in NLP/Communication analysis.
- **Local Inference**: The system runs ML models locally within the `ai-service` container for low-latency response.

## Monitoring & Reporting
- **Gmail API**: Integration for real-time inbox monitoring (via Google Cloud Console).
- **WHOIS/TLD Intelligence**: Used by the URL engine to score domain reputation.

## Deployment Platforms
- **Vercel**: Automated CI/CD for the React frontend.
- **Render**: Managed hosting for the Node.js API and Python AI service.
- **GitHub Actions**: Potential CI/CD for testing and linting.
