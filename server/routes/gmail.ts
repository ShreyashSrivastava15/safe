import express from 'express';
import { google } from 'googleapis';
import { prisma } from '../utils/prisma';
import { supabase } from '../utils/supabaseClient';

const router = express.Router();

const getOAuthClient = async (userId: string) => {
    const googleToken = await prisma.googleToken.findUnique({
        where: { user_id: userId }
    });

    if (!googleToken) {
        throw new Error('Google account not connected');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: googleToken.access_token,
        refresh_token: googleToken.refresh_token || undefined,
        expiry_date: googleToken.expiry_date ? Number(googleToken.expiry_date) : undefined
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            await prisma.googleToken.update({
                where: { user_id: userId },
                data: {
                    access_token: tokens.access_token,
                    expiry_date: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
                    refresh_token: tokens.refresh_token || undefined
                }
            });
        }
    });

    return oauth2Client;
};

// GET /api/v1/gmail/fetch
router.get('/fetch', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const oauth2Client = await getOAuthClient(user.id);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const listRes = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
            maxResults: 5
        });

        const messages = listRes.data.messages || [];
        const detailedMessages = [];

        for (const msg of messages) {
            const detailRes = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id!,
                format: 'full'
            });

            const data = detailRes.data;
            const headers = data.payload?.headers || [];
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const sender = headers.find(h => h.name === 'From')?.value || 'Unknown';

            // Basic body extraction
            let body = data.snippet || '';

            detailedMessages.push({
                id: data.id,
                subject,
                sender,
                body,
                snippet: data.snippet
            });
        }

        res.json(detailedMessages);

    } catch (error: any) {
        console.error('Gmail fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch emails' });
    }
});

export default router;
