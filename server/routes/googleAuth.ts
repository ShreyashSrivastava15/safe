import express from 'express';
import { google } from 'googleapis';
import { prisma } from '../utils/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = express.Router();

const getOAuth2Client = (redirectUri?: string) => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
    );
};

// GET /auth/google (Initial Redirect)
router.get('/google', async (req, res) => {
    const { userId } = req.query;
    console.log(`[GoogleAuth] Initializing OAuth for userId: ${userId}`);

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify user exists locally
    const user = await prisma.user.findUnique({
        where: { id: userId as string }
    });

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const oauth2Client = getOAuth2Client();

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: userId, // Pass local userId in state
        prompt: 'consent'
    });

    res.redirect(url);
});

// GET /auth/google/callback
router.get('/google/callback', async (req, res) => {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
        return res.status(400).send('Authorization code or User ID missing');
    }

    try {
        const oauth2Client = getOAuth2Client();
        console.log(`[GoogleAuth] Exchanging code. Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
        const { tokens } = await oauth2Client.getToken(code as string);

        // Save tokens to local PostgreSQL database
        await prisma.googleToken.upsert({
            where: { user_id: userId as string },
            update: {
                access_token: tokens.access_token!,
                refresh_token: tokens.refresh_token || undefined,
                expiry_date: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            },
            create: {
                user_id: userId as string,
                access_token: tokens.access_token!,
                refresh_token: tokens.refresh_token || null,
                expiry_date: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            }
        });

        // Redirect back to frontend dashboard
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        res.redirect(`${frontendUrl}/dashboard?connected=true`);

    } catch (error: any) {
        console.error('Error exchanging code for tokens:', error.response?.data || error.message || error);
        res.status(500).send(`Authentication failed: ${error.message || 'Check server logs'}`);
    }
});

// GET /auth/status (Check if user has connected Google)
router.get('/status', authenticateJWT, async (req: AuthRequest, res) => {
    const userId = req.user?.userId;

    try {
        const token = await prisma.googleToken.findUnique({
            where: { user_id: userId }
        });

        res.json({ connected: !!token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check connection status' });
    }
});

export default router;
