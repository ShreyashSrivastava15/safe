# Task: Complete Gmail OAuth & Integration

Finish the end-to-end "Connect Gmail" feature to allow users to securely fetch emails for scam analysis.

## Sub-tasks
1. [x] **Database Setup**: Add `google_tokens` table to Prisma schema.
2. [x] **Backend OAuth**: Implement `/auth/google` and `/auth/google/callback`.
3. [x] **Backend Gmail Service**: Implement `/api/v1/gmail/fetch` with token refreshing.
4. [ ] **Frontend UI (Current)**: Update `AnalyzeView` to:
   - Check connection status on mount.
   - Display "Connected" status.
   - Handle the OAuth redirect loop.
5. [ ] **Verification**: Test fetching unread emails through the new secure pipeline.
