import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listProfiles() {
  const profiles = await prisma.profile.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Profiles in DB:', JSON.stringify(profiles, null, 2));
}

listProfiles()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
