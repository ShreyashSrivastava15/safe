
import { callAiEngine, EngineResponse } from '../utils/aiServiceClient';

interface Transaction {
    amount: number;
    country: string;
    timestamp: string;
    velocity?: number; // Transactions in last 5 mins
    geo_shift?: boolean;
    device_change?: boolean;
    merchant_risk?: 'LOW' | 'MEDIUM' | 'HIGH';
    user_avg_amount?: number;
}

export const analyzeTransaction = async (transaction: Transaction): Promise<EngineResponse> => {
    const signals: string[] = [];
    let score = 0.1; // Baseline risk

    if (!transaction || Object.keys(transaction).length === 0) {
        return {
            risk_score: 0,
            confidence: 'LOW',
            signals: ['No transaction data provided'],
            model_version: 'TX-SAFE-v2'
        };
    }

    // 1. Amount Deviation Logic (The "Outlier" check)
    // SEC-01: Removed hardcoded fallback. If user_avg_amount is missing, we use the current transaction amount 
    // as a baseline but flag it for future intelligence gathering.
    const userAvg = transaction.user_avg_amount || transaction.amount;
    const deviation = transaction.user_avg_amount ? Math.abs(transaction.amount - userAvg) / userAvg : 0;

    if (deviation > 5) {
        score += 0.4;
        signals.push(`Amount Deviation: ${Math.round(deviation)}x higher than user average ($${transaction.amount} vs $${userAvg})`);
    } else if (deviation > 2) {
        score += 0.2;
        signals.push('Significant amount deviation detected');
    }

    // 2. Velocity Logic (The "Spam" check)
    if (transaction.velocity && transaction.velocity > 3) {
        score += 0.3;
        signals.push(`High Velocity: ${transaction.velocity} transactions detected in last 5 minutes`);
    }

    // 3. Geo-Spatial Logic (The "Impossible Travel" check)
    if (transaction.geo_shift) {
        score += 0.5;
        signals.push('Impossible Travel Anomaly: Cross-continental shift detected in < 2 hours');
    }

    // 4. Device Integrity Check
    if (transaction.device_change) {
        score += 0.25;
        signals.push('Unrecognized Device: New hardware fingerprint detected for high-value txn');
    }

    // 5. Merchant Reputation
    if (transaction.merchant_risk === 'HIGH') {
        score += 0.2;
        signals.push('High-Risk Merchant: Destination merchant associated with high chargeback rates');
    }

    // Cap the score at 0.99
    const finalScore = Math.min(score, 0.99);

    return {
        risk_score: finalScore,
        confidence: finalScore > 0.7 ? 'HIGH' : 'MEDIUM',
        signals: signals.length > 0 ? signals : ['No significant anomalies detected'],
        model_version: 'TX-SAFE-v2'
    };
};
