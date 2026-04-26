import { analyzeRisk } from '../server/services/riskEngine';

async function runDynamicTrustTest() {
    console.log("🚀 STARTING DYNAMIC TRUST FORENSIC VALIDATION\n");

    // TEST 1: Genuine Official Communication (Stripe)
    console.log("--- TEST 1: GENUINE OFFICIAL SOURCE (Stripe) ---");
    const genuineResult = await analyzeRisk({
        message: "From: Stripe Support <support@stripe.com>\nSubject: Your account payout is ready\n\nPlease check your dashboard for the latest payout details.",
        url: "",
        transaction: null,
        fraud_type: 'email',
        // @ts-ignore - metadata added in previous step
        metadata: { auth_results: "dkim=pass spf=pass" }
    });
    console.log(`Verdict: ${genuineResult.verdict}`);
    console.log(`Risk Score: ${genuineResult.final_score}`);
    console.log(`Findings: ${genuineResult.findings.map(f => f.label).join(', ')}`);
    console.log(`Reputation Boost: ${genuineResult.signals.find(s => s.includes('Reputation')) || 'NONE'}\n`);

    // TEST 2: Identity Spoofing Attempt (Claiming to be Groww but failing DKIM)
    console.log("--- TEST 2: IDENTITY SPOOFING ATTEMPT (Fake Groww) ---");
    const spoofResult = await analyzeRisk({
        message: "From: Groww <noreply@groww.in>\nSubject: Urgent: Verify your MTF positions\n\nYour MTF positions will be liquidated if not verified immediately.",
        url: "",
        transaction: null,
        fraud_type: 'email',
        // @ts-ignore
        metadata: { auth_results: "dkim=fail spf=softfail" }
    });
    console.log(`Verdict: ${spoofResult.verdict}`);
    console.log(`Risk Score: ${spoofResult.final_score}`);
    console.log(`Findings: ${spoofResult.findings.map(f => f.label).join(', ')}`);
    console.log(`Spoof Signal: ${spoofResult.findings.some(f => f.label.includes('Cryptographic')) ? '✅ DETECTED' : '❌ MISSED'}\n`);

    // TEST 3: Unlisted Domain (Neutral)
    console.log("--- TEST 3: NEUTRAL EXTERNAL DOMAIN ---");
    const neutralResult = await analyzeRisk({
        message: "From: Shreyash <shreyash@random-startup.io>\nSubject: Meeting next week\n\nHi, let's catch up on Tuesday.",
        url: "",
        transaction: null,
        fraud_type: 'email',
        // @ts-ignore
        metadata: { auth_results: "dkim=pass spf=pass" }
    });
    console.log(`Verdict: ${neutralResult.verdict}`);
    console.log(`Risk Score: ${neutralResult.final_score}`);
    console.log("-------------------------------------------\n");
}

runDynamicTrustTest().catch(console.error);
