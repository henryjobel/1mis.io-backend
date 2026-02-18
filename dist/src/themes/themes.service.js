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
exports.ThemesService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ThemesService = class ThemesService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    presets() {
        return [
            {
                key: 'minimal',
                name: 'Minimal',
                description: 'Clean launch-ready storefront',
            },
            {
                key: 'aurora',
                name: 'Aurora',
                description: 'Colorful premium conversion layout',
            },
            {
                key: 'mono',
                name: 'Mono Luxe',
                description: 'Bold typography focused checkout flow',
            },
            {
                key: 'spark',
                name: 'Spark Grid',
                description: 'High-density catalog experience',
            },
        ];
    }
    async storeTheme(storeId) {
        const theme = await this.prisma.themeConfig.findUnique({
            where: { storeId },
        });
        return {
            theme,
            presets: this.presets(),
        };
    }
    async apply(storeId, data, actor) {
        const theme = await this.prisma.themeConfig.upsert({
            where: { storeId },
            create: {
                storeId,
                preset: data.preset,
                customJson: data.customJson,
            },
            update: {
                preset: data.preset,
                customJson: data.customJson,
            },
        });
        await this.prisma.store.update({
            where: { id: storeId },
            data: { themePreset: data.preset },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'theme.apply',
            entityType: 'ThemeConfig',
            entityId: theme.id,
            metaJson: { storeId, preset: data.preset },
        });
        return theme;
    }
};
exports.ThemesService = ThemesService;
exports.ThemesService = ThemesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ThemesService);
//# sourceMappingURL=themes.service.js.map