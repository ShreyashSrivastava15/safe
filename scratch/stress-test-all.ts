import { analyzeRisk } from '../server/services/riskEngine';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testCases = [
    // --- EMAIL & COMMS ---
    { fraud_type: 'email', message: 'Sender: noreply@amazon-security-login.com\nSubject: [URGENT] Your account is locked. Click to verify: bit.ly/3xY7z' },
    { fraud_type: 'email', message: 'Sender: mom@gmail.com\nSubject: Dinner tonight?\nHi sweetie, are we still meeting at 7pm for dinner? Love you!' },
    { fraud_type: 'email', message: 'Sender: support@chase-online-banking.net\nSubject: Unusual Activity Detected\nImmediate action required to prevent account suspension. Log in here.' },
    { fraud_type: 'email', message: 'Subject: Your Daily Newsletter\nHere are the top stories for today...' },
    { fraud_type: 'email', message: 'Subject: YOU WON $1,000,000!!\nClaim your lottery prize now by providing your bank details.' },

    // --- URL INTEL ---
    { fraud_type: 'url', url: 'https://paypa1-security.com/login' },
    { fraud_type: 'url', url: 'https://google.com' },
    { fraud_type: 'url', url: 'https://apple-id-verify.support-center.tk' },
    { fraud_type: 'url', url: 'https://github.com/shreyashsrivastava' },
    { fraud_type: 'url', url: 'https://official-tax-refund.gov.verify-id.xyz' },

    // --- MESSAGING ---
    { fraud_type: 'message', message: '[DHL] Your package delivery failed. Pay $1.99 to reschedule: dhl-reschedule.com' },
    { fraud_type: 'message', message: 'Hey, are you coming to the party tonight?' },
    { fraud_type: 'message', message: '[HDFC BANK] Your OTP for transaction of Rs. 25,000 is 8831. If not you, call 1800-FAKE-NUM.' },
    { fraud_type: 'message', message: 'Reminder: Dentist appointment tomorrow at 10 AM.' },
    { fraud_type: 'message', message: 'URGENT: Your Netflix subscription has expired. Update payment: netflix-renewal.top' },

    // --- FINANCIAL ---
    { fraud_type: 'transaction', transaction: { amount: 5000, country: 'IN', velocity: 10, geo_shift: true, device_change: true } },
    { fraud_type: 'transaction', transaction: { amount: 45.20, country: 'US', velocity: 1, geo_shift: false, device_change: false } },
    { fraud_type: 'transaction', transaction: { amount: 890, country: 'GB', velocity: 1, geo_shift: true, device_change: false } },
    { fraud_type: 'transaction', transaction: { amount: 15.00, country: 'US', velocity: 5, geo_shift: false, device_change: false } },
    { fraud_type: 'transaction', transaction: { amount: 12500, country: 'US', velocity: 1, geo_shift: false, device_change: true } },

    // --- E-COMMERCE ---
    { fraud_type: 'ecommerce', url: 'https://cheap-iphones-90-off.com', message: 'Flash Sale! iPhone 15 Pro for only $99! Limited stock.' },
    { fraud_type: 'ecommerce', url: 'https://nike.com' },
    { fraud_type: 'ecommerce', url: 'https://luxury-rolex-giveaway.shop', message: 'Free Rolex giveaway for first 100 visitors!' },
    { fraud_type: 'ecommerce', url: 'https://amazon.com' },
    { fraud_type: 'ecommerce', url: 'https://store-verify-payment.xyz', message: 'Secure checkout for your order.' }
];

async function runTests() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found for testing.");
        return;
    }
    const userId = user.id;
    console.log(`Starting Stress Test for User: ${user.email} (${userId})`);

    for (const test of testCases) {
        try {
            process.stdout.write(`Testing ${test.fraud_type}... `);
            const result = await analyzeRisk({
                message: test.message || '',
                url: test.url || '',
                transaction: (test as any).transaction,
                fraud_type: test.fraud_type
            });

            await prisma.analysisLog.create({
                data: {
                    user_id: userId,
                    fraud_type: test.fraud_type,
                    message: test.message || null,
                    url: test.url || null,
                    transaction_json: (test as any).transaction || ({} as any),
                    scores_json: result.scores as any,
                    signals: result.signals as any,
                    findings_json: result.findings as any,
                    final_score: result.final_score,
                    risk_level: result.risk_level,
                    verdict: result.verdict,
                    explanation: result.explanation,
                    confidence: result.confidence,
                    recommendation: result.recommendation
                }
            });
            console.log(`[DONE] Result: ${result.verdict} (${result.final_score})`);
        } catch (e: any) {
            console.log(`[FAILED] ${e.message}`);
        }
    }
    console.log("All tests completed!");
}

runTests()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
