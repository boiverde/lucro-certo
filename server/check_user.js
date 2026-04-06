const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:%23Verde15793@db.qfahagyxugfjzrigkmkp.supabase.co:5432/postgres" // DIRECT_URL
    }
  }
});

async function main() {
  const email = 'admin@lucrocerto.com';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    console.log("User EXISTS:", user.email, "Hash:", user.password_hash);
    const valid = await bcrypt.compare('admin123', user.password_hash);
    if (valid) {
      console.log("Password 'admin123' is VALID!");
    } else {
      console.log("Password 'admin123' is INVALID.");
      const password_hash = await bcrypt.hash('admin123', 6);
      await prisma.user.update({
         where: { email },
         data: { password_hash }
      });
      console.log("Updated password to 'admin123'");
    }
  } else {
    console.log("User NOT FOUND. Creating...");
    const password_hash = await bcrypt.hash('admin123', 6);
    user = await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password_hash
      }
    });
    console.log("User CREATED:", user.email);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
