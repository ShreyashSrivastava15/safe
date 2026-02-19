import dotenv from 'dotenv';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 2;

export interface EngineResponse {
    risk_score: number;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    signals: string[];
    model_version: string;
    latency_ms?: number;
}

export const callAiEngine = async (endpoint: string, content: string, data?: any, retryCount = 0): Promise<EngineResponse> => {
    const startTime = Date.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, data }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`AI Service HTTP error: ${response.status}`);
        }

        const result = await response.json();
        const latency = Date.now() - startTime;

        return { ...result, latency_ms: latency };
    } catch (error: any) {
        const latency = Date.now() - startTime;

        if (retryCount < MAX_RETRIES && (error.name === 'AbortError' || error.message.includes('ECONNREFUSED'))) {
            console.warn(`Retry ${retryCount + 1} for ${endpoint} after error: ${error.message}`);
            return await callAiEngine(endpoint, content, data, retryCount + 1);
        }

        console.error(`Error calling AI Engine ${endpoint} (Latency: ${latency}ms):`, error.message);

        // Graceful degradation
        return {
            risk_score: 0.5,
            confidence: 'LOW',
            signals: [`AI Engine error (${endpoint}): ${error.message}`],
            model_version: 'fallback-v1',
            latency_ms: latency
        };
    }
};
