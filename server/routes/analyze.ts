import express from 'express';
import { analyzeRisk } from '../services/riskEngine';
import { supabase } from '../utils/supabaseClient';
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
}).refine(data => data.message || data.url || data.transaction, {
    message: "At least one input (message, url, transaction) is required",
});

router.post('/analyze', async (req, res) => {
    try {
        // Validate input
        const validationResult = analyzeSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.errors
            });
        }

        const { message, url, transaction } = validationResult.data;

        const result = await analyzeRisk({
            message: message || '',
            url: url || '',
            transaction: transaction
        });

        // Log to Supabase with enhanced metadata
        const { error } = await supabase
            .from('analysis_logs')
            .insert({
                message: message || null,
                url: url || null,
                transaction_json: transaction || null,
                scores_json: result.scores,
                signals: result.signals, // Assuming this column exists or is handled by jsonb
                final_score: result.final_score,
                risk_level: result.risk_level,
                verdict: result.verdict,
                explanation: result.explanation
            });

        if (error) {
            console.error('Supabase logging error:', error);
        }

        res.json(result);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
