import { analyzeText } from './nlpService';
import { analyzeUrl } from './urlService';
import { analyzeTransaction } from './transactionService';
import { analyzeJobOffer } from './jobOfferService';
import { analyzeSocialEngineering } from './socialEngineeringService';
import { EngineResponse } from '../utils/aiServiceClient';

interface RiskAnalysisResult {
    scores: {
        nlp: number;
        url: number;
        transaction: number;
        job_offer: number;
        social_engineering: number;
    };
    signals: string[];
    final_score: number;
    risk_level: 'SAFE' | 'SUSPICIOUS' | 'FRAUD';
    verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT';
    explanation: string;
}

export const analyzeRisk = async (data: { message: string; url: string; transaction: any }): Promise<RiskAnalysisResult> => {
    const startTime = Date.now();

    // Run all 5 engines in parallel
    const [nlpResult, urlResult, txResult, jobResult, socialResult] = await Promise.all([
        analyzeText(data.message || ''),
        analyzeUrl(data.url || ''),
        analyzeTransaction(data.transaction || {}),
        analyzeJobOffer(data.message || ''),
        analyzeSocialEngineering(data.message || ''),
    ]);

    // Production-grade weights
    const weights = {
        nlp: 0.25,
        url: 0.25,
        transaction: 0.20,
        job_offer: 0.15,
        social_engineering: 0.15
    };

    const finalScore = (nlpResult.risk_score * weights.nlp) +
        (urlResult.risk_score * weights.url) +
        (txResult.risk_score * weights.transaction) +
        (jobResult.risk_score * weights.job_offer) +
        (socialResult.risk_score * weights.social_engineering);

    // Aggregate signals from all engines
    const allSignals = [
        ...nlpResult.signals.map(s => `[Comm] ${s}`),
        ...urlResult.signals.map(s => `[URL] ${s}`),
        ...txResult.signals.map(s => `[TX] ${s}`),
        ...jobResult.signals.map(s => `[Job] ${s}`),
        ...socialResult.signals.map(s => `[SocEng] ${s}`)
    ].filter(s => s && !s.includes('No significant') && !s.includes('No typical') && !s.includes('AI Engine error'));

    let verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT' = 'SAFE';
    let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'FRAUD' = 'SAFE';

    if (finalScore >= 0.7) {
        verdict = 'FRAUDULENT';
        riskLevel = 'FRAUD';
    } else if (finalScore >= 0.4) {
        verdict = 'SUSPICIOUS';
        riskLevel = 'SUSPICIOUS';
    }

    // Hardening: Enforce signals for SUSPICIOUS or FRAUD
    if (riskLevel !== 'SAFE' && allSignals.length === 0) {
        allSignals.push("[System] Suspicious activity detected based on aggregate score indicators.");
    }

    const totalLatency = Date.now() - startTime;
    console.log(`[Performance] Multi-modal analysis completed in ${totalLatency}ms`);
    console.log(`[Latency] NLP: ${nlpResult.latency_ms}ms, URL: ${urlResult.latency_ms}ms, TX: ${txResult.latency_ms}ms, Job: ${jobResult.latency_ms}ms, Social: ${socialResult.latency_ms}ms`);

    const explanation = allSignals.length > 0
        ? `S.A.F.E. Analysis Summary: ${allSignals.slice(0, 4).join('; ')}.`
        : "Verified safe. No significant fraud signatures detected across 5-tier detection pipeline.";

    return {
        scores: {
            nlp: nlpResult.risk_score,
            url: urlResult.risk_score,
            transaction: txResult.risk_score,
            job_offer: jobResult.risk_score,
            social_engineering: socialResult.risk_score
        },
        signals: allSignals,
        final_score: parseFloat(finalScore.toFixed(2)),
        risk_level: riskLevel,
        verdict: verdict,
        explanation: explanation
    };
};
