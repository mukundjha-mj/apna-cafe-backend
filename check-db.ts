import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cafes = await prisma.cafe.findMany();
  console.log('--- CAFES ---');
  console.log(JSON.stringify(cafes, null, 2));

  const itemsCount = await prisma.menuItem.count();
  console.log('\n--- MENU ITEMS COUNT ---');
  console.log(itemsCount);

  const activeOrders = await prisma.order.count({
    where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } }
  });
  console.log('\n--- ACTIVE ORDERS COUNT ---');
  console.log(activeOrders);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
