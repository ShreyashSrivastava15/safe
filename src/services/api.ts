import { supabase } from "@/integrations/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface AnalysisRequest {
    message?: string;
    url?: string;
    transaction?: {
        amount: number;
        country: string;
        timestamp: string;
    };
    fraud_type: 'email' | 'url' | 'transaction' | 'ecommerce' | 'message';
}

export interface AnalysisResponse {
    scores: {
        nlp?: number;
        url?: number;
        transaction?: number;
    };
    signals: string[];
    final_score: number;
    risk_level: 'SAFE' | 'SUSPICIOUS' | 'FRAUD';
    verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT';
    explanation: string;
}

export const analyzeRisk = async (data: AnalysisRequest): Promise<AnalysisResponse> => {
    // Instant Mock Analysis for Presentations
    return new Promise((resolve) => {
        setTimeout(() => {
            const hasLink = data.message?.includes('http') || data.url;
            const hasUrgency = data.message?.toLowerCase().includes('urgent') || data.message?.toLowerCase().includes('immediately');
            
            let final_score = 0.15; // Safe default
            if (hasLink) final_score += 0.45;
            if (hasUrgency) final_score += 0.35;
            if (final_score > 0.95) final_score = 0.98;

            const risk_level = final_score > 0.7 ? 'FRAUD' : final_score > 0.4 ? 'SUSPICIOUS' : 'SAFE';
            const verdict = final_score > 0.7 ? 'FRAUDULENT' : final_score > 0.4 ? 'SUSPICIOUS' : 'SAFE';

            resolve({
                scores: {
                    nlp: final_score * 0.8,
                    url: hasLink ? 0.92 : 0.1,
                    transaction: data.transaction ? 0.4 : undefined
                },
                signals: [
                    risk_level === 'FRAUD' ? "[Comm] High pressure manipulative language detected" : "[Comm] Message structure appears normal",
                    hasLink ? "[URL] Phishing pattern detected in link structure" : "[URL] No malicious links found",
                    hasUrgency ? "[Comm] Artificial urgency detected (Psychological trigger)" : "[Comm] Neutral tone detected"
                ],
                final_score,
                risk_level,
                verdict,
                explanation: risk_level === 'FRAUD' 
                    ? "S.A.F.E. Engine has identified high-risk indicators: manipulative tone combined with a suspicious external link. Highly likely to be a phishing attempt."
                    : "Analysis complete. The input appears to be safe with no significant fraud indicators detected."
            });
        }, 1200); // Slight delay for realistic feel
    });
};

export const getRecentLogs = async () => {
    // Return static mock logs for presentation
    return [
        { id: 1, verdict: 'FRAUDULENT', risk_level: 'FRAUD', created_at: new Date().toISOString(), message: 'Urgent: Your account is locked. Click here.' },
        { id: 2, verdict: 'SAFE', risk_level: 'SAFE', created_at: new Date(Date.now() - 3600000).toISOString(), message: 'Hello, how are you today?' },
        { id: 3, verdict: 'SUSPICIOUS', risk_level: 'SUSPICIOUS', created_at: new Date(Date.now() - 7200000).toISOString(), url: 'http://bit.ly/claim-prize-99' }
    ];
};
