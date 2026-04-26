import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'shreyashsr2004@gmail.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Checking if admin user exists: ${email}...`);

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        console.log('Admin user already exists. Updating password to "admin123"...');
        await prisma.user.update({
            where: { email },
            data: { password_hash: hashedPassword }
        });
    } else {
        console.log('Creating new admin user...');
        await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                full_name: 'System Administrator'
            }
        });
    }

    console.log('✅ Admin account ready!');
    console.log(`ID: ${email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch(e => {
        console.error('❌ Failed to seed admin user. Is the database running?');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
