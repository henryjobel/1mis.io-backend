"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'admin@1mis.io';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        await prisma.user.create({
            data: {
                name: 'Platform Admin',
                email,
                passwordHash: await (0, bcrypt_1.hash)('admin12345', 10),
                role: client_1.Role.super_admin,
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
//# sourceMappingURL=seed.js.map