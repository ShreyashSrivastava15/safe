import { callAiEngine, EngineResponse } from '../utils/aiServiceClient';

export const analyzeJobOffer = async (text: string): Promise<EngineResponse> => {
    if (!text) {
        return {
            risk_score: 0,
            confidence: 'LOW',
            signals: ['No content provided'],
            model_version: 'n/a'
        };
    }
    return await callAiEngine('/analyze/job-offer', text);
};
