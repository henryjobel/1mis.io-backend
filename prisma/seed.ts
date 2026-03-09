import { hash } from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const planSeeds = [
  {
    key: 'free',
    name: 'Free',
    priceBdt: 0,
    billingCycleDays: 30,
    productLimit: 5,
    aiLimit: 20,
    storageLimitMb: 512,
    customDomainAllowed: false,
    advancedAiEnabled: false,
    analyticsEnabled: false,
    prioritySupport: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    key: 'starter',
    name: 'Starter',
    priceBdt: 499,
    billingCycleDays: 30,
    productLimit: 50,
    aiLimit: 250,
    storageLimitMb: 5120,
    customDomainAllowed: true,
    advancedAiEnabled: false,
    analyticsEnabled: false,
    prioritySupport: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    key: 'growth',
    name: 'Growth',
    priceBdt: 1499,
    billingCycleDays: 30,
    productLimit: null,
    aiLimit: null,
    storageLimitMb: 25600,
    customDomainAllowed: true,
    advancedAiEnabled: true,
    analyticsEnabled: true,
    prioritySupport: true,
    isActive: true,
    sortOrder: 3,
  },
];

async function main() {
  for (const plan of planSeeds) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      create: plan,
      update: plan,
    });
  }

  const email = 'admin@1mis.io';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Platform Admin',
        email,
        passwordHash: await hash('admin12345', 10),
        role: Role.super_admin,
      },
    });
  }

  console.log(
    'Seed complete: plans ready + super admin -> admin@1mis.io / admin12345',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
