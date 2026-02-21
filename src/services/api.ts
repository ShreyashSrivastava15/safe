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
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error('You must be logged in to perform an analysis.');
    }

    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized or unverified user.');
        throw new Error('Analysis failed');
    }

    return response.json();
};

export const getRecentLogs = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        throw new Error('User must be authenticated to fetch logs.');
    }

    const { data, error } = await (supabase as any)
        .from('analysis_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw error;
    return data;
};
