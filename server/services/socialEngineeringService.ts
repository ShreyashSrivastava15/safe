import { callAiEngine, EngineResponse } from '../utils/aiServiceClient';

export const analyzeSocialEngineering = async (text: string): Promise<EngineResponse> => {
    if (!text) {
        return {
            risk_score: 0,
            confidence: 'LOW',
            signals: ['No content provided'],
            model_version: 'n/a'
        };
    }
    return await callAiEngine('/analyze/social-engineering', text);
};
