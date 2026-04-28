
export const riskConfig = {
    weights: {
        nlp: 0.40,
        url: 0.30,
        tx: 0.30,
        single_engine: 1.0,
        dual_engine_nlp_url: {
            nlp: 0.60,
            url: 0.40
        }
    },
    thresholds: {
        fraud: 0.7,
        suspicious: 0.4,
        confidence_base: 0.85
    },
    reputation: {
        trust_reduction_factor: 0.7,
        spoof_penalty: 0.4
    }
};
