import { callAiEngine, EngineResponse } from '../utils/aiServiceClient';

export const analyzeUrl = async (url: string): Promise<EngineResponse> => {
    if (!url) {
        return {
            risk_score: 0,
            confidence: 'LOW',
            signals: ['No URL provided'],
            model_version: 'n/a'
        };
    }
    return await callAiEngine('/analyze/url', url);
};
