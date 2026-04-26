import express from 'express';
import { analyzeRisk } from '../services/riskEngine';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Input validation schema
const analyzeSchema = z.object({
    message: z.string().optional(),
    url: z.string().optional(),
    transaction: z.object({
        amount: z.number().optional(),
        country: z.string().optional(),
        timestamp: z.string().optional(),
        velocity: z.number().int().positive().optional(),
        geo_shift: z.boolean().optional(),
        device_change: z.boolean().optional(),
    }).optional(),
    fraud_type: z.enum(['email', 'url', 'transaction', 'ecommerce', 'message']),
}).refine(data => data.message || data.url || data.transaction, {
    message: "At least one input (message, url, transaction) is required",
});

router.post('/analyze', authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate input
        const validationResult = analyzeSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.errors
            });
        }

        const { message, url, transaction, fraud_type } = validationResult.data;

        const result = await analyzeRisk({
            message: message || '',
            url: url || '',
            transaction: transaction,
            fraud_type: fraud_type
        });

        // Log to database using Prisma
        try {
            await prisma.analysisLog.create({
                data: {
                    user_id: userId,
                    fraud_type: fraud_type,
                    message: message || null,
                    url: url || null,
                    transaction_json: transaction || ({} as any),
                    scores_json: result.scores as any,
                    signals: result.signals as any,
                    findings_json: result.findings as any,
                    final_score: result.final_score,
                    risk_level: result.risk_level,
                    verdict: result.verdict,
                    explanation: result.explanation,
                    confidence: result.confidence,
                    recommendation: result.recommendation
                }
            });
        } catch (dbError) {
            console.error('Prisma logging error:', dbError);
        }

        res.json(result);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/analyze/history
// Returns the analysis history for the authenticated user
router.get('/history', authenticateJWT, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        console.log(`[History] Fetching logs for userId: ${userId}`);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const logs = await prisma.analysisLog.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        res.json(logs);
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
