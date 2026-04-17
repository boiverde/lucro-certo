const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    console.log("Found user:", user.email, user.name);
    // Let's create a test user or just extract their ID to test endpoints locally,
    // Or we use their credentials if we know them. Since passwords are hashed,
    // let's create a test user.
    
    // We can just sign a JWT using the secret.
    const jwtSecret = 'supersecret-dev-key-change-in-prod'; // From .env
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '1h' });
    console.log("Token:", token);
    
    // Create connection to Render endpoint
    const url = 'https://lucro-certolucerto-api.onrender.com';
    // or local...
    console.log("Use this token to query locally or remote");
}

main().catch(console.error).finally(() => prisma.$disconnect());
