import express from 'express';
import { google } from 'googleapis';
import { prisma } from '../utils/prisma';
import { supabase } from '../utils/supabaseClient';

const router = express.Router();

const getBaseOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    );
};

// GET /auth/google
router.get('/google', (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const dynamicRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        dynamicRedirectUri
    );

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: userId,
        prompt: 'consent' // Forces refresh_token
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
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers.host;
        const dynamicRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/auth/google/callback`;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            dynamicRedirectUri
        );
        const { tokens } = await oauth2Client.getToken(code as string);

        // Save tokens to database
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

        // Redirect back to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        res.redirect(`${frontendUrl}/analyze/email?connected=true`);

    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        res.status(500).send('Authentication failed');
    }
});

// GET /auth/status/:userId
router.get('/status/:userId', async (req, res) => {
    const { userId } = req.params;

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
