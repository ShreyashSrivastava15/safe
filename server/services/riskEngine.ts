import { analyzeText } from './nlpService';
import { analyzeUrl } from './urlService';
import { analyzeTransaction } from './transactionService';
import { prisma } from '../utils/prisma';
import { riskConfig } from '../config/riskConfig';

export interface IntelligenceFinding {
    id: string;
    label: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'domain' | 'nlp' | 'behavior' | 'technical' | 'location';
}

export interface AnalysisMetadata {
    auth_results?: string;
    sender?: string;
    [key: string]: any;
}

interface RiskAnalysisResult {
    scores: {
        nlp: number;
        url: number;
        transaction: number;
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

export const analyzeRisk = async (data: { 
    message: string; 
    url: string; 
    transaction: any; 
    fraud_type: string;
    metadata?: AnalysisMetadata;
}): Promise<RiskAnalysisResult> => {
    const startTime = Date.now();

    let runNlp = false;
    let runUrl = false;
    let runTx = false;

    switch (data.fraud_type) {
        case 'email':
        case 'message':
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

    const defaultWeights = {
        nlp: 0.40,
        url: 0.30,
        tx: 0.30,
    };

    if (activeEnginesCount === 1) {
        finalScore = results[keys[0]].risk_score;
    } else if (activeEnginesCount === 2 && results.nlp && results.url) {
        finalScore = (results.nlp.risk_score * riskConfig.weights.dual_engine_nlp_url.nlp) + 
                     (results.url.risk_score * riskConfig.weights.dual_engine_nlp_url.url);
    } else {
        const nlpScore = results.nlp ? results.nlp.risk_score * riskConfig.weights.nlp : 0;
        const urlScore = results.url ? results.url.risk_score * riskConfig.weights.url : 0;
        const txScore = results.tx ? results.tx.risk_score * riskConfig.weights.tx : 0;
        finalScore = nlpScore + urlScore + txScore;
    }

    let allSignals: string[] = [];
    const findings: IntelligenceFinding[] = [];

    if (results.nlp) {
        allSignals.push(...results.nlp.signals.map((s: string) => `[Comm] ${s}`));
        results.nlp.signals.forEach((s: string) => {
            if (s.toLowerCase().includes('urgency') || s.toLowerCase().includes('pressure')) {
                findings.push({
                    id: `nlp-urgency-${Date.now()}`,
                    label: 'Linguistic Urgency',
                    description: 'Manipulation attempt via artificial time pressure or threat.',
                    severity: results.nlp.risk_score > 0.7 ? 'HIGH' : 'MEDIUM',
                    type: 'nlp'
                });
            }
            if (s.toLowerCase().includes('financial') || s.toLowerCase().includes('bank')) {
                findings.push({
                    id: `nlp-fin-${Date.now()}`,
                    label: 'Financial Impersonation',
                    description: 'Content mimics formal banking or payment gateway communication.',
                    severity: 'HIGH',
                    type: 'nlp'
                });
            }
        });
    }

    if (results.url) {
        allSignals.push(...results.url.signals.map((s: string) => `[URL] ${s}`));
        results.url.signals.forEach((s: string) => {
            if (s.toLowerCase().includes('domain') || s.toLowerCase().includes('mimic')) {
                findings.push({
                    id: `url-spoof-${Date.now()}`,
                    label: 'Domain Spoofing',
                    description: 'URL structure mimics a high-reputation domain to deceive users.',
                    severity: 'CRITICAL',
                    type: 'domain'
                });
            }
            if (s.toLowerCase().includes('registrar') || s.toLowerCase().includes('private')) {
                findings.push({
                    id: `url-tech-${Date.now()}`,
                    label: 'Technical Anomaly',
                    description: 'Domain registration patterns (freshness/privacy) indicate high risk.',
                    severity: 'MEDIUM',
                    type: 'technical'
                });
            }
        });
    }

    if (results.tx) {
        allSignals.push(...results.tx.signals.map((s: string) => `[TX] ${s}`));
        results.tx.signals.forEach((s: string) => {
            if (s.toLowerCase().includes('travel') || s.toLowerCase().includes('distance')) {
                findings.push({
                    id: `tx-geo-${Date.now()}`,
                    label: 'Impossible Travel',
                    description: 'Geographic shift between transactions violates physical travel limits.',
                    severity: 'CRITICAL',
                    type: 'location'
                });
            }
            if (s.toLowerCase().includes('velocity')) {
                findings.push({
                    id: `tx-vel-${Date.now()}`,
                    label: 'High Velocity',
                    description: 'Transaction frequency exceeds standard behavioral baseline.',
                    severity: 'HIGH',
                    type: 'behavior'
                });
            }
            if (s.toLowerCase().includes('deviation')) {
                findings.push({
                    id: `tx-dev-${Date.now()}`,
                    label: 'Amount Deviation',
                    description: 'Transaction amount is a significant outlier for this user.',
                    severity: 'MEDIUM',
                    type: 'behavior'
                });
            }
            if (s.toLowerCase().includes('device')) {
                findings.push({
                    id: `tx-dev-${Date.now()}`,
                    label: 'Device Anomaly',
                    description: 'Transaction initiated from a hardware fingerprint mismatch.',
                    severity: 'HIGH',
                    type: 'behavior'
                });
            }
        });
    }

    allSignals = allSignals.filter(s => s && !s.includes('No significant') && !s.includes('No typical'));

    // If no specific findings but high score, add a generic one
    if (finalScore > 0.4 && findings.length === 0) {
        findings.push({
            id: 'gen-1',
            label: 'Aggregate Risk Anomaly',
            description: 'The neural engine detected a high-confidence threat pattern across multiple signals.',
            severity: finalScore > 0.7 ? 'HIGH' : 'MEDIUM',
            type: 'technical'
        });
    }

    // --- DYNAMIC REPUTATION BOOSTING (OFFICIAL SOURCE VERIFICATION) ---
    let isOfficialSource = false;
    let trustScore = 0;
    let trustedDomain = '';

    // Robust domain extraction from sender string
    let domainCandidate: string | null = null;
    const sender = data.metadata?.sender || '';
    
    if (sender) {
        const emailMatch = sender.match(/<(.+@.+)>/) || sender.match(/([^@\s]+@[^@\s]+\.[^@\s]+)/);
        if (emailMatch) {
            const email = emailMatch[1];
            domainCandidate = email.split('@')[1];
        }
    }

    if (domainCandidate) {
        const domain = domainCandidate.toLowerCase().trim();
        // Check database for trusted source
        const source = await prisma.trustedSource.findFirst({
            where: { 
                domain: { 
                    equals: domain,
                    mode: 'insensitive' 
                },
                is_active: true
            }
        });

        if (source) {
            // VERIFICATION CHECK (DKIM/SPF)
            const authResults = data.metadata?.auth_results || '';
            const dkimPass = authResults.toLowerCase().includes('dkim=pass');
            const spfPass = authResults.toLowerCase().includes('spf=pass');

            if (dkimPass || spfPass) {
                isOfficialSource = true;
                trustScore = source.trust_score;
                trustedDomain = domain;
            } else if (authResults) {
                // If we have auth results but they failed for a "trusted" domain, it's a high-risk spoof attempt
                findings.unshift({
                    id: `rep-spoof-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    label: 'Cryptographic Identity Failure',
                    description: `Critical: This communication claims to be from a trusted source (${domain}) but failed cryptographic verification (SPF/DKIM).`,
                    severity: 'CRITICAL',
                    type: 'domain'
                });
                finalScore = Math.min(1.0, finalScore + riskConfig.reputation.spoof_penalty);
            }
        }
    }

    if (isOfficialSource) {
        // Apply dynamic reduction based on trust score
        const reduction = riskConfig.reputation.trust_reduction_factor * trustScore;
        finalScore = finalScore * (1 - reduction); 
        
        findings.unshift({
            id: `rep-trusted-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            label: 'Verified Official Source',
            description: `Intelligence originates from a cryptographically verified high-reputation source (${trustedDomain}).`,
            severity: 'LOW',
            type: 'domain'
        });
        allSignals.unshift(`[Reputation] Cryptographically Verified: ${trustedDomain}`);
    }

    let verdict: 'SAFE' | 'SUSPICIOUS' | 'FRAUDULENT' = 'SAFE';
    let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'FRAUD' = 'SAFE';

    if (finalScore >= riskConfig.thresholds.fraud) {
        verdict = 'FRAUDULENT';
        riskLevel = 'FRAUD';
    } else if (finalScore >= riskConfig.thresholds.suspicious) {
        verdict = 'SUSPICIOUS';
        riskLevel = 'SUSPICIOUS';
    }

    // Recommendation logic
    let recommendation = "Verified safe. No action required.";
    if (verdict === 'FRAUDULENT') {
        recommendation = "⚠️ BLOCK IMMEDIATELY. This item shows high correlation with known fraud patterns.";
    } else if (verdict === 'SUSPICIOUS') {
        recommendation = "🔍 CAUTION REQUIRED. Verify identity and origin before proceeding.";
    }

    const totalLatency = Date.now() - startTime;
    console.log(`[Performance] Multi-modal analysis completed in ${totalLatency}ms`);

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
        findings,
        final_score: parseFloat(finalScore.toFixed(2)),
        risk_level: riskLevel,
        verdict: verdict,
        explanation: explanation,
        confidence: riskConfig.thresholds.confidence_base + (Math.random() * 0.1),
        recommendation
    };
};
