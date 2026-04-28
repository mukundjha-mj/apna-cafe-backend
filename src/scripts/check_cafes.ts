
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCafes() {
  const cafes = await prisma.cafe.findMany();
  console.log('Cafes in DB:', JSON.stringify(cafes, null, 2));
}

checkCafes()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
