import express from 'express';
import { analyzeRisk } from '../services/riskEngine';
import { supabase } from '../utils/supabaseClient';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const router = express.Router();

// Input validation schema
const analyzeSchema = z.object({
    message: z.string().optional(),
    url: z.string().optional(),
    transaction: z.object({
        amount: z.number().optional(),
        country: z.string().optional(),
        timestamp: z.string().optional(),
        velocity: z.number().optional(),
        geo_shift: z.boolean().optional(),
        device_change: z.boolean().optional(),
    }).optional(),
    fraud_type: z.enum(['email', 'url', 'transaction', 'ecommerce']),
}).refine(data => data.message || data.url || data.transaction, {
    message: "At least one input (message, url, transaction) is required",
});

router.post('/analyze', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }
        const token = authHeader.split(' ')[1];

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized', details: authError });
        }

        if (!user.email_confirmed_at) {
            return res.status(401).json({ error: 'Email must be verified to perform analysis.' });
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
                    user_id: user.id,
                    fraud_type: fraud_type,
                    message: message || null,
                    url: url || null,
                    transaction_json: transaction || ({} as any),
                    scores_json: result.scores as any,
                    signals: result.signals as any,
                    final_score: result.final_score,
                    risk_level: result.risk_level,
                    verdict: result.verdict,
                    explanation: result.explanation
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

export default router;
