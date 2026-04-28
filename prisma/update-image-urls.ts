import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageMap: Record<string, string> = {
  pizza: '/assets/food/pizza.png',
  burger: '/assets/food/burger.png',
  burgers: '/assets/food/burger.png',
  fries: '/assets/food/fries.png',
  momo: '/assets/food/momos.png',
  momos: '/assets/food/momos.png',
  shakes: '/assets/food/shakes.png',
  drinks: '/assets/food/shakes.png',
  combo: '/assets/food/combo.png',
  combos: '/assets/food/combo.png',
};

async function main() {
  const items = await prisma.menuItem.findMany();
  let updatedCount = 0;

  for (const item of items) {
    const key = String(item.imageUrl || item.category || '').toLowerCase();
    const resolved = imageMap[key] || item.imageUrl;
    if (resolved && resolved !== item.imageUrl) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: resolved },
      });
      updatedCount += 1;
    }
  }

  console.log(`Updated imageUrl for ${updatedCount} menu items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
