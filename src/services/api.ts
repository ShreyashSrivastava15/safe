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
    // Graceful fallback for mock mode
    let token = "mock_token";
    try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || "mock_token";
    } catch (e) {
        console.warn("Supabase session fetch failed, using mock token");
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
    let userId = "00000000-0000-0000-0000-000000000000";
    try {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id || userId;
    } catch (e) {}

    const { data, error } = await (supabase as any)
        .from('analysis_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.warn("Supabase fetch failed, returning empty logs for mock mode");
        return [];
    }
    return data;
};
