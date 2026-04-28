
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCafes() {
  try {
    const cafes = await prisma.cafe.findMany();
    console.log('Cafes in DB:', JSON.stringify(cafes, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkCafes();
