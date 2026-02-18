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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(storeId) {
        const grouped = await this.prisma.order.groupBy({
            by: ['customerEmail', 'customerName'],
            where: { storeId },
            _count: { _all: true },
            _sum: { total: true },
            orderBy: { _count: { customerEmail: 'desc' } },
        });
        return grouped.map((row) => ({
            customerEmail: row.customerEmail,
            customerName: row.customerName,
            orders: row._count._all,
            totalSpent: row._sum.total,
        }));
    }
    orders(storeId, email) {
        return this.prisma.order.findMany({
            where: { storeId, customerEmail: email },
            include: { items: true, shipment: true, paymentTxns: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map