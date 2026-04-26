const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface AnalysisRequest {
    message?: string;
    url?: string;
    transaction?: {
        amount: number;
        country: string;
        timestamp: string;
        device_change?: boolean;
        geo_shift?: boolean;
        velocity?: number;
    };
    fraud_type: 'email' | 'url' | 'transaction' | 'ecommerce' | 'message';
}

export interface IntelligenceFinding {
    id: string;
    label: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'domain' | 'nlp' | 'behavior' | 'technical' | 'location';
}

export interface AnalysisResponse {
    scores: {
        nlp?: number;
        url?: number;
        transaction?: number;
    };
    signals: string[];
    findings: IntelligenceFinding[];
    final_score: number;
    risk_level: 'SAFE' | 'SUSPICIOUS' | 'FRAUD';
    verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT';
    explanation: string;
    confidence: number;
    recommendation: string;
}

export const analyzeRisk = async (data: AnalysisRequest): Promise<AnalysisResponse> => {
    const token = localStorage.getItem('safe_auth_token');
    
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Analysis failed');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Analysis API error:", error);
        throw error;
    }
};

export const getRecentLogs = async () => {
    const token = localStorage.getItem('safe_auth_token');
    
    try {
        const response = await fetch(`${API_URL}/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch logs');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Logs API error:", error);
        return []; 
    }
};
