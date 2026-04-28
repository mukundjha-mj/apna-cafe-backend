import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('--- RECENT ORDERS ---');
  orders.forEach(o => {
    console.log(`ID: ${o.id}, Status: ${o.status}, CreatedAt: ${o.createdAt}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
