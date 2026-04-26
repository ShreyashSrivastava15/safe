import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found to seed data for. Please register first.");
        return;
    }

    const userId = user.id;
    console.log(`Seeding demo data for user: ${user.email} (${userId})`);

    const demoLogs = [
        {
            user_id: userId,
            fraud_type: 'transaction',
            message: 'High-value transfer simulation',
            transaction_json: {
                amount: 4892.50,
                currency: "USD",
                country: "ID",
                device: "iPhone 12 (new)",
                previousLocation: "US",
                deviceChange: true,
                impossibleTravel: true
            },
            final_score: 0.89,
            risk_level: 'FRAUD',
            verdict: 'FRAUDULENT',
            explanation: 'Impossible Travel: London → Jakarta in 7 hours; New device detected; Transaction 15x higher than average.',
            confidence: 0.94,
            recommendation: '⚠️ BLOCK THIS TRANSACTION immediately. Contact cardholder for verification.',
            findings_json: [
                { id: 'f1', label: 'Impossible Travel', description: 'User traveled between continents in less than 8 hours.', severity: 'CRITICAL', type: 'location' },
                { id: 'f2', label: 'New Device', description: 'Transaction initiated from a device never seen on this account.', severity: 'HIGH', type: 'behavior' }
            ],
            signals: ['[TX] Impossible travel signature', '[TX] Velocity threshold exceeded', '[TX] New device fingerprint']
        },
        {
            user_id: userId,
            fraud_type: 'email',
            message: 'Sender: noreply-amazon-support@amazonsecurity-verify.com\nSubject: [URGENT] Your Account Security Alert\n\nDear customer, your account has been locked. Verify here: bit.ly/verify-now',
            final_score: 0.94,
            risk_level: 'FRAUD',
            verdict: 'FRAUDULENT',
            explanation: 'Domain Spoofing (amazonsecurity-verify.com); Urgency language detected; Credential request present.',
            confidence: 0.98,
            recommendation: '🛑 DO NOT OPEN. This is a high-confidence phishing attempt impersonating Amazon.',
            findings_json: [
                { id: 'e1', label: 'Domain Spoofing', description: 'Sender domain mimics Amazon but is registered to a private party.', severity: 'CRITICAL', type: 'domain' },
                { id: 'e2', label: 'Urgency Language', description: 'Email uses aggressive "URGENT" and "IMMEDIATE" keywords.', severity: 'HIGH', type: 'nlp' }
            ],
            signals: ['[Comm] Phishing domain detected', '[Comm] Manipulative urgency detected', '[Comm] Shortened link analysis: bit.ly']
        },
        {
            user_id: userId,
            fraud_type: 'url',
            url: 'https://secure-paypa1.com/login',
            final_score: 0.91,
            risk_level: 'FRAUD',
            verdict: 'FRAUDULENT',
            explanation: 'Typosquatting detected (paypa1 vs paypal); TLD reputation low (.com is ok but domain is 2 days old).',
            confidence: 0.92,
            recommendation: '⚠️ DO NOT VISIT. This site is a visual clone of PayPal designed to steal credentials.',
            findings_json: [
                { id: 'u1', label: 'Typosquatting', description: 'Domain name uses "1" instead of "l" to deceive users.', severity: 'CRITICAL', type: 'domain' },
                { id: 'u2', label: 'Fresh Domain', description: 'Domain was registered less than 48 hours ago.', severity: 'HIGH', type: 'technical' }
            ],
            signals: ['[URL] High similarity to paypal.com (92%)', '[URL] Registrar: NameCheap', '[URL] WHOIS Privacy enabled']
        }
    ];

    for (const log of demoLogs) {
        await prisma.analysisLog.create({
            data: log as any
        });
    }

    console.log("Demo data seeded successfully!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
