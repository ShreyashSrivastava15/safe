import express from 'express';
import { supabase } from '../utils/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../utils/prisma';

const router = express.Router();

// Initialize superuser client for administrative actions
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Middleware to verify if the requester is the official admin
const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || user.email !== 'shreyashsr2004@gmail.com') {
        return res.status(403).json({ error: 'Administrative privileges required' });
    }
    next();
};

// DELETE user account
router.delete('/users/:userId', verifyAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Server misconfiguration: Service role key missing');
        }

        console.log(`[Admin] Initiating deletion for user: ${userId}`);

        // 1. Delete associated logs from Prisma
        await prisma.analysisLog.deleteMany({
            where: { user_id: userId as string }
        });

        // 2. Delete the user from Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId as string);

        if (deleteError) throw deleteError;

        res.json({ success: true, message: 'User permanently removed' });
    } catch (error: any) {
        console.error('[Admin Error] Deletion failed:', error);
        res.status(500).json({ error: error.message || 'Failed to remove user' });
    }
});

export default router;
