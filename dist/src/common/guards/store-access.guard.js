"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const SUPER_ROLES = [
    client_1.Role.super_admin,
    client_1.Role.ops,
    client_1.Role.support,
    client_1.Role.finance,
];
let StoreAccessGuard = class StoreAccessGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user)
            return false;
        if (SUPER_ROLES.includes(user.role)) {
            return true;
        }
        const storeId = req.params.id ?? req.params.storeId;
        if (!storeId)
            return true;
        const owned = await this.prisma.store.findFirst({
            where: { id: storeId, ownerId: user.id },
            select: { id: true },
        });
        if (owned)
            return true;
        const member = await this.prisma.storeMember.findUnique({
            where: {
                storeId_userId: {
                    storeId,
                    userId: user.id,
                },
            },
            select: { storeId: true },
        });
        return !!member;
    }
};
exports.StoreAccessGuard = StoreAccessGuard;
exports.StoreAccessGuard = StoreAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoreAccessGuard);
//# sourceMappingURL=store-access.guard.js.map