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
}

export interface AnalysisResponse {
    scores: {
        nlp: number;
        url: number;
        transaction: number;
    };
    final_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT';
}

export const analyzeRisk = async (data: AnalysisRequest): Promise<AnalysisResponse> => {
    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Analysis failed');
    }

    return response.json();
};

export const getRecentLogs = async () => {
    const { data, error } = await (supabase as any)
        .from('analysis_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw error;
    return data;
};
