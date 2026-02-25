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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const normalizedStatus = this.parseOrderStatus(options?.status);
        const where = {
            storeId,
            ...(normalizedStatus ? { status: normalizedStatus } : {}),
            ...(options?.q
                ? {
                    OR: [
                        { customerName: { contains: options.q, mode: 'insensitive' } },
                        { customerEmail: { contains: options.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
        };
        const orders = await this.prisma.order.findMany({
            where,
            select: {
                customerEmail: true,
                customerName: true,
                total: true,
                createdAt: true,
            },
        });
        const grouped = new Map();
        for (const row of orders) {
            const key = row.customerEmail.trim().toLowerCase();
            const existing = grouped.get(key);
            if (!existing) {
                grouped.set(key, {
                    customerEmail: row.customerEmail,
                    customerName: row.customerName,
                    orders: 1,
                    totalSpent: Number(row.total),
                    lastOrderAt: row.createdAt.toISOString(),
                });
                continue;
            }
            existing.orders += 1;
            existing.totalSpent += Number(row.total);
            if (row.createdAt.toISOString() > existing.lastOrderAt) {
                existing.lastOrderAt = row.createdAt.toISOString();
            }
        }
        const itemsRaw = Array.from(grouped.values());
        const itemsSorted = itemsRaw.sort((a, b) => this.compareCustomers(a, b, options?.sort));
        const total = itemsSorted.length;
        const skip = (page - 1) * limit;
        const items = itemsSorted.slice(skip, skip + limit);
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    orders(storeId, email) {
        return this.prisma.order.findMany({
            where: { storeId, customerEmail: email },
            include: { items: true, shipment: true, paymentTxns: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    parseOrderStatus(value) {
        if (!value)
            return undefined;
        const raw = String(value).trim().toLowerCase();
        if (raw === 'completed')
            return client_1.OrderStatus.delivered;
        return Object.values(client_1.OrderStatus).find((status) => status === raw);
    }
    compareCustomers(a, b, sort) {
        const key = String(sort ?? 'lastOrder_desc').trim().toLowerCase();
        if (key === 'customer_asc') {
            return a.customerName.localeCompare(b.customerName);
        }
        if (key === 'customer_desc') {
            return b.customerName.localeCompare(a.customerName);
        }
        if (key === 'orders_asc') {
            return a.orders - b.orders;
        }
        if (key === 'orders_desc') {
            return b.orders - a.orders;
        }
        if (key === 'totalspent_asc') {
            return a.totalSpent - b.totalSpent;
        }
        if (key === 'totalspent_desc') {
            return b.totalSpent - a.totalSpent;
        }
        if (key === 'lastorder_asc') {
            return a.lastOrderAt.localeCompare(b.lastOrderAt);
        }
        return b.lastOrderAt.localeCompare(a.lastOrderAt);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map