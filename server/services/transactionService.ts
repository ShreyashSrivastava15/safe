import { callAiEngine, EngineResponse } from '../utils/aiServiceClient';

interface Transaction {
    amount: number;
    country: string;
    timestamp: string;
    velocity?: number;
    geo_shift?: boolean;
    device_change?: boolean;
}

export const analyzeTransaction = async (transaction: Transaction): Promise<EngineResponse> => {
    if (!transaction || Object.keys(transaction).length === 0) {
        return {
            risk_score: 0,
            confidence: 'LOW',
            signals: ['No transaction data provided'],
            model_version: 'n/a'
        };
    }

    // Convert transaction data to the format expected by the AI service
    return await callAiEngine('/analyze/transaction', '', transaction);
};
