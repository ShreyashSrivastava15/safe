/**
 * S.A.F.E. (Scam Analysis and Fraud Elimination)
 * Multi-Category Production Test Suite
 * 
 * This script runs automated test cases for all fraud categories.
 * It uses specialized scoring logic to verify that at least ONE specialized
 * engine detects the threat even if the cumulative aggregate is low.
 */

const API_ENDPOINT = 'http://localhost:3000/api/v1/analyze';

interface TestCase {
    category: string;
    description: string;
    payload: {
        message?: string;
        url?: string;
        transaction?: any;
    };
}

const tests: TestCase[] = [
    {
        category: "Email & Communication",
        description: "Official-looking Phishing Email",
        payload: {
            message: "Dear user, your Microsoft account has been suspended for security reasons. Immediate action required. Please verify at http://microsoft-verify-secure.top/login",
            url: "http://microsoft-verify-secure.top/login"
        }
    },
    {
        category: "Message-Based (SMS)",
        description: "Bank SMS Smishing",
        payload: {
            message: "SBI Alert: Your NetBanking account will be blocked today. Update your KYC here: http://bit.ly/sbi-kyc-verify. Do not share your OTP 123456.",
            url: "http://bit.ly/sbi-kyc-verify"
        }
    },
    {
        category: "Phishing URLs",
        description: "Malicious Homograph Domain",
        payload: {
            url: "http://paypaI-secure.xyz/dashboard",
            message: "Security alert for your PayPal account."
        }
    },
    {
        category: "Job & Offer Scams",
        description: "Fake Interview Fee",
        payload: {
            message: "Congratulations! You have been shortlisted for a Remote Manager role. To confirm your interview, please pay the fully refundable $50 security deposit.",
        }
    },
    {
        category: "Financial Transactions",
        description: "High Velocity Anomaly",
        payload: {
            transaction: {
                amount: 15000,
                country: "NG",
                velocity: 12,
                geo_shift: true
            }
        }
    },
    {
        category: "Social Engineering",
        description: "Lottery Scam",
        payload: {
            message: "URGENT NOTICE: You have won $1,000,000 in the Google Annual Lottery. Contact us at google-prize@scam.top to claim."
        }
    },
    {
        category: "Identity & Account",
        description: "SIM Swap / KYC Scam",
        payload: {
            message: "Your SIM card service will stop in 24 hours. Send a clear photo of your driving license to support@telecom-verify.com to prevent suspension."
        }
    },
    {
        category: "E-Commerce",
        description: "Fake Marketplace Lure",
        payload: {
            message: "iPhone 15 Pro Max for only $199! Limited stock available. Buy now before the timer runs out at http://cheap-electronics.top",
            url: "http://cheap-electronics.top"
        }
    },
    {
        category: "Corporate Fraud",
        description: "CEO Impersonation (BEC)",
        payload: {
            message: "Hi, this is the CEO. I'm in a meeting and need you to handle a vendor payment of $5,000 immediately. I'll send the bank details in a moment."
        }
    },
    {
        category: "Government Impersonation",
        description: "Tax Penalty Threat",
        payload: {
            message: "Internal Revenue Service: You have a pending tax penalty of $2,450. Failure to pay by 5 PM today will result in an arrest warrant."
        }
    },
    {
        category: "Crypto & Investment",
        description: "Crypto Giveaway Scam",
        payload: {
            message: "ELON MUSK GIVEAWAY: Send 1 BTC to our secure wallet and receive 2 BTC back instantly! 100% Guaranteed profit."
        }
    },
    {
        category: "AI-Enabled Scams",
        description: "Hyper-Personalized Bot Message",
        payload: {
            message: "Hello [Name], I noticed you recently visited our shop. We've optimized a special investment plan just for you. Reply 'START' to earn 200% returns."
        }
    },
    {
        category: "High-Confidence Multi-Vector",
        description: "Phishing + Urgency + Malicious URL",
        payload: {
            message: "CRITICAL: Suspicious login on your Coinbase account. If this wasn't you, secure your funds immediately at: http://coinbase-safety.xyz/verify-account",
            url: "http://coinbase-safety.xyz/verify-account"
        }
    }
];

async function runBenchmark() {
    console.log("\x1b[36m================================================================================\x1b[0m");
    console.log("\x1b[36m                S.A.F.E. MULTI-CATEGORY SCAN BENCHMARK                          \x1b[0m");
    console.log("\x1b[36m================================================================================\x1b[0m\n");

    let detectedCount = 0;

    for (const test of tests) {
        console.log(`\x1b[1m[Test Case]\x1b[0m \x1b[34m${test.category.padEnd(25)}\x1b[0m | ${test.description}`);

        try {
            const start = Date.now();
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.payload)
            });

            const duration = Date.now() - start;
            const data = await response.json();

            // Safety check for response format
            if (!data.scores) throw new Error("Invalid response from API");

            const scores = data.scores;
            const maxEngineScore = Math.max(...Object.values(scores) as number[]);

            // Success Criteria:
            // 1. Overall risk Level is not SAFE
            // 2. OR at least one specialized engine is highly confident (> 0.6)
            const isDetected = data.risk_level !== 'SAFE' || maxEngineScore > 0.6;

            if (isDetected) {
                console.log(`\x1b[32m  Result: DETECTED\x1b[0m (${duration}ms)`);
                detectedCount++;
            } else {
                console.log(`\x1b[33m  Result: CLEAN/LOW RISK\x1b[0m (${duration}ms)`);
            }

            console.log(`  └─ Aggregate Score: ${data.final_score.toFixed(2)} | Risk Level: ${data.risk_level}`);

            // Show breakdown for transparency
            const engineHits = Object.entries(scores)
                .filter(([_, val]) => (val as number) > 0.3)
                .map(([key, val]) => `${key.toUpperCase()}: ${(val as number).toFixed(2)}`);

            if (engineHits.length > 0) {
                console.log(`  └─ Engine Hits: ${engineHits.join(' | ')}`);
            }

            if (data.signals && data.signals.length > 0) {
                console.log(`  └─ Signals: ${data.signals.slice(0, 3).join(', ')}${data.signals.length > 3 ? '...' : ''}`);
            }

        } catch (err: any) {
            console.log(`\x1b[31m  Result: ERROR\x1b[0m - ${err.message}`);
        }
        console.log("-".repeat(80));
    }

    console.log(`\n\x1b[1mBenchmark Summary: ${detectedCount}/${tests.length} threats identified.\x1b[0m`);
    console.log("\x1b[36m================================================================================\x1b[0m");
}

runBenchmark();
