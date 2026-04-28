import express from 'express';
import { google } from 'googleapis';
import { prisma } from '../utils/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { analyzeRisk } from '../services/riskEngine';
import { notificationService } from '../services/notificationService';

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
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
    );

    oauth2Client.setCredentials({
        access_token: googleToken.access_token,
        refresh_token: googleToken.refresh_token || undefined,
        expiry_date: googleToken.expiry_date ? Number(googleToken.expiry_date) : undefined
    });

    // Handle token refresh automatically
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
// Fetches unread emails and automatically runs fraud analysis on them
router.get('/fetch', authenticateJWT, async (req: AuthRequest, res) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const oauth2Client = await getOAuthClient(userId);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const listRes = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
            maxResults: 50
        });

        const messages = listRes.data.messages || [];
        const analysisResults = [];

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
            const body = data.snippet || '';

            const authResults = headers.find(h => h.name === 'Authentication-Results')?.value || '';

            // Run Fraud Analysis
            const result = await analyzeRisk({
                message: `Sender: ${sender}\nSubject: ${subject}\n\n${body}`,
                url: '',
                transaction: null,
                fraud_type: 'email',
                metadata: { auth_results: authResults }
            });

            // Log to database
            const log = await prisma.analysisLog.create({
                data: {
                    user_id: userId,
                    fraud_type: 'email',
                    message: `Sender: ${sender}\nSubject: ${subject}\n\n${body}`,
                    scores_json: result.scores as any,
                    signals: result.signals as any,
                    final_score: result.final_score,
                    risk_level: result.risk_level,
                    verdict: result.verdict,
                    explanation: result.explanation
                }
            });

            analysisResults.push({
                id: data.id,
                subject,
                sender,
                snippet: body,
                risk_level: result.risk_level,
                final_score: result.final_score,
                verdict: result.verdict,
                log_id: log.id
            });
        }

        res.json({
            count: analysisResults.length,
            results: analysisResults
        });
    } catch (error: any) {
        console.error('Gmail fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch and analyze emails' });
    }
});

// POST /api/v1/gmail/watch
// Enables real-time push notifications for the user's inbox
router.post('/watch', authenticateJWT, async (req: AuthRequest, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const oauth2Client = await getOAuthClient(userId);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const topicName = process.env.GOOGLE_PUBSUB_TOPIC || 'projects/safe-fraud-detection/topics/gmail-notifications';

        const watchRes = await gmail.users.watch({
            userId: 'me',
            requestBody: {
                topicName,
                labelIds: ['INBOX']
            }
        });

        res.json({
            success: true,
            message: 'Real-time monitoring enabled',
            data: watchRes.data
        });
    } catch (error: any) {
        console.error('Gmail watch error:', error);
        res.status(500).json({ error: error.message || 'Failed to enable push notifications' });
    }
});

// POST /api/v1/gmail/webhook
// Endpoint called by Google Cloud Pub/Sub when new mail arrives
router.post('/webhook', async (req, res) => {
    // Note: This endpoint is usually public or verified via token
    try {
        const { message } = req.body;
        if (!message || !message.data) {
            return res.status(400).send('No message data');
        }

        // Decode base64 data
        const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
        const emailAddress = data.emailAddress;
        const historyId = data.historyId;

        console.log(`[Gmail Webhook] Update for ${emailAddress}, historyId: ${historyId}`);

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email: emailAddress } });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const oauth2Client = await getOAuthClient(user.id);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Fetch latest messages since last historyId (or just last 1 for simplicity in demo)
        const listRes = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 1,
            q: 'is:unread'
        });

        const messages = listRes.data.messages || [];
        if (messages.length > 0) {
            const msgId = messages[0].id!;
            const detailRes = await gmail.users.messages.get({ userId: 'me', id: msgId });
            const msgData = detailRes.data;
            
            const headers = msgData.payload?.headers || [];
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const sender = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const body = msgData.snippet || '';

            // Run Analysis
            const result = await analyzeRisk({
                message: `Sender: ${sender}\nSubject: ${subject}\n\n${body}`,
                url: '',
                transaction: null,
                fraud_type: 'email',
                metadata: { sender }
            });

            // Log to database
            await prisma.analysisLog.create({
                data: {
                    user_id: user.id,
                    fraud_type: 'email',
                    message: `Sender: ${sender}\nSubject: ${subject}\n\n${body}`,
                    scores_json: result.scores as any,
                    signals: result.signals as any,
                    final_score: result.final_score,
                    risk_level: result.risk_level,
                    verdict: result.verdict,
                    explanation: result.explanation
                }
            });

            // TRIGGER REAL-TIME NOTIFICATION
            if (result.risk_level !== 'SAFE') {
                notificationService.sendNotification(user.id, {
                    title: `🚨 ${result.risk_level} Detected in Inbox`,
                    message: `Suspicious activity from ${sender}. Subject: ${subject}`,
                    type: result.risk_level === 'FRAUD' ? 'FRAUD' : 'SUSPICIOUS',
                    link: `/history`
                });
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Internal Error');
    }
});

export default router;
