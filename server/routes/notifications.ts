import express from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// GET /api/v1/notifications/stream
// SSE endpoint for real-time notifications
router.get('/stream', authenticateJWT, (req: AuthRequest, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log(`[SSE] User ${userId} connected to notification stream`);

    const onNotification = (notification: any) => {
        if (notification.userId === userId) {
            res.write(`data: ${JSON.stringify(notification)}\n\n`);
        }
    };

    notificationService.on('new_notification', onNotification);

    // Keep-alive heartbeats
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);

    req.on('close', () => {
        console.log(`[SSE] User ${userId} disconnected`);
        notificationService.off('new_notification', onNotification);
        clearInterval(heartbeat);
    });
});

// GET /api/v1/notifications
// Fetch notification history
router.get('/', authenticateJWT, (req: AuthRequest, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = notificationService.getUserNotifications(userId);
    res.json(notifications);
});

export default router;
