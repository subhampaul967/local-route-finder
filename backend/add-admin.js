const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres_422l_user:wjQD0MSdW8YUbebLY3MJsYFy9znZ1kKI@dpg-d5a1g3je5dus73erk2h0-a.virginia-postgres.render.com/postgres_422l'
    }
  }
});

async function addAdmin() {
  try {
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin();
