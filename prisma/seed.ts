import { hash } from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Seed complete: super admin ready -> admin@1mis.io / admin12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
