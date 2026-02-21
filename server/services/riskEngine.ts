import { analyzeText } from './nlpService';
import { analyzeUrl } from './urlService';
import { analyzeTransaction } from './transactionService';
import { EngineResponse } from '../utils/aiServiceClient';

interface RiskAnalysisResult {
    scores: {
        nlp: number;
        url: number;
        transaction: number;
    };
    signals: string[];
    final_score: number;
    risk_level: 'SAFE' | 'SUSPICIOUS' | 'FRAUD';
    verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT';
    explanation: string;
}

export const analyzeRisk = async (data: { message: string; url: string; transaction: any; fraud_type: string }): Promise<RiskAnalysisResult> => {
    const startTime = Date.now();

    let runNlp = false;
    let runUrl = false;
    let runTx = false;

    switch (data.fraud_type) {
        case 'email':
            runNlp = true;
            break;
        case 'url':
            runUrl = true;
            break;
        case 'transaction':
            runTx = true;
            break;
        case 'ecommerce':
            runNlp = true;
            runUrl = true;
            break;
        default:
            // Fallback for missing/invalid fraud_type
            runNlp = true;
            runUrl = true;
            runTx = true;
            break;
    }

    const promises: Promise<any>[] = [];
    const keys: string[] = [];

    if (runNlp) {
        promises.push(analyzeText(data.message || ''));
        keys.push('nlp');
    }
    if (runUrl) {
        promises.push(analyzeUrl(data.url || ''));
        keys.push('url');
    }
    if (runTx) {
        promises.push(analyzeTransaction(data.transaction || {}));
        keys.push('tx');
    }

    const resultsArray = await Promise.all(promises);

    const results: Record<string, any> = {};
    keys.forEach((key, index) => {
        results[key] = resultsArray[index];
    });

    const activeEnginesCount = keys.length;
    let finalScore = 0;

    // Default weights
    const defaultWeights = {
        nlp: 0.40,
        url: 0.30,
        tx: 0.30,
    };

    if (activeEnginesCount === 1) {
        finalScore = results[keys[0]].risk_score;
    } else if (activeEnginesCount === 2) {
        // e.g. ecommerce (nlp + url)
        finalScore = (results.nlp.risk_score * 0.60) + (results.url.risk_score * 0.40);
    } else {
        finalScore = (results.nlp.risk_score * defaultWeights.nlp) +
            (results.url.risk_score * defaultWeights.url) +
            (results.tx.risk_score * defaultWeights.tx);
    }

    let allSignals: string[] = [];
    if (results.nlp) allSignals.push(...results.nlp.signals.map((s: string) => `[Comm] ${s}`));
    if (results.url) allSignals.push(...results.url.signals.map((s: string) => `[URL] ${s}`));
    if (results.tx) allSignals.push(...results.tx.signals.map((s: string) => `[TX] ${s}`));

    allSignals = allSignals.filter(s => s && !s.includes('No significant') && !s.includes('No typical') && !s.includes('AI Engine error'));

    let verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT' = 'SAFE';
    let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'FRAUD' = 'SAFE';

    if (finalScore >= 0.7) {
        verdict = 'FRAUDULENT';
        riskLevel = 'FRAUD';
    } else if (finalScore >= 0.4) {
        verdict = 'SUSPICIOUS';
        riskLevel = 'SUSPICIOUS';
    }

    if (riskLevel !== 'SAFE' && allSignals.length === 0) {
        allSignals.push("[System] Suspicious activity detected based on aggregate score indicators.");
    }

    const totalLatency = Date.now() - startTime;
    console.log(`[Performance] Multi-modal analysis completed in ${totalLatency}ms for ${data.fraud_type}`);

    const explanation = allSignals.length > 0
        ? `S.A.F.E. Analysis Summary: ${allSignals.slice(0, 4).join('; ')}.`
        : `Verified safe. No significant fraud signatures detected by the active engines.`;

    return {
        scores: {
            nlp: results.nlp ? results.nlp.risk_score : 0,
            url: results.url ? results.url.risk_score : 0,
            transaction: results.tx ? results.tx.risk_score : 0,
        },
        signals: allSignals,
        final_score: parseFloat(finalScore.toFixed(2)),
        risk_level: riskLevel,
        verdict: verdict,
        explanation: explanation
    };
};
