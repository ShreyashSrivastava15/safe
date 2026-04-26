import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const trustedSources = [
    { domain: 'groww.in', name: 'Groww', category: 'Financial', trust_score: 1.0 },
    { domain: 'mpokket.com', name: 'mPokket', category: 'Financial', trust_score: 1.0 },
    { domain: 'mpokket.in', name: 'mPokket', category: 'Financial', trust_score: 1.0 },
    { domain: 'amazon.com', name: 'Amazon', category: 'Tech', trust_score: 1.0 },
    { domain: 'amazon.in', name: 'Amazon', category: 'Tech', trust_score: 1.0 },
    { domain: 'google.com', name: 'Google', category: 'Tech', trust_score: 1.0 },
    { domain: 'microsoft.com', name: 'Microsoft', category: 'Tech', trust_score: 1.0 },
    { domain: 'apple.com', name: 'Apple', category: 'Tech', trust_score: 1.0 },
    { domain: 'github.com', name: 'GitHub', category: 'Tech', trust_score: 1.0 },
    { domain: 'paypal.com', name: 'PayPal', category: 'Financial', trust_score: 1.0 },
    { domain: 'stripe.com', name: 'Stripe', category: 'Financial', trust_score: 1.0 },
    { domain: 'linkedin.com', name: 'LinkedIn', category: 'Professional', trust_score: 1.0 },
    { domain: 'hdfcbank.com', name: 'HDFC Bank', category: 'Financial', trust_score: 1.0 },
    { domain: 'icicibank.com', name: 'ICICI Bank', category: 'Financial', trust_score: 1.0 },
    { domain: 'axisbank.com', name: 'Axis Bank', category: 'Financial', trust_score: 1.0 },
    { domain: 'zerodha.com', name: 'Zerodha', category: 'Financial', trust_score: 1.0 },
    { domain: 'binance.com', name: 'Binance', category: 'Financial', trust_score: 1.0 },
    { domain: 'coinbase.com', name: 'Coinbase', category: 'Financial', trust_score: 1.0 },
    { domain: 'netflix.com', name: 'Netflix', category: 'Entertainment', trust_score: 1.0 }
];

async function seed() {
    console.log("Seeding Trusted Sources...");
    for (const source of trustedSources) {
        await prisma.trustedSource.upsert({
            where: { domain: source.domain },
            update: source,
            create: source
        });
        process.stdout.write(`+ ${source.domain} `);
    }
    console.log("\nSeeding completed!");
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
