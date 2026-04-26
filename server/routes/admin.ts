import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Middleware to verify if the requester is the official admin
const verifyAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const userEmail = req.user?.email; // We need to add email to the JWT payload if it's not there

    if (userEmail !== 'shreyashsr2004@gmail.com') {
        return res.status(403).json({ error: 'Administrative privileges required' });
    }
    next();
};

// GET /api/v1/admin/stats
router.get('/stats', authenticateJWT, verifyAdmin, async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const scanCount = await prisma.analysisLog.count();
        const recentLogs = await prisma.analysisLog.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
            include: { user: { select: { email: true } } }
        });

        res.json({
            userCount,
            scanCount,
            recentLogs
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// DELETE user account
router.delete('/users/:userId', authenticateJWT, verifyAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Delete associated data
        await prisma.analysisLog.deleteMany({
            where: { user_id: userId }
        });
        
        await prisma.googleToken.deleteMany({
            where: { user_id: userId }
        });

        // 2. Delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ success: true, message: 'User permanently removed' });
    } catch (error: any) {
        console.error('[Admin Error] Deletion failed:', error);
        res.status(500).json({ error: error.message || 'Failed to remove user' });
    }
});

export default router;
