import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.analysisLog.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(logs, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
