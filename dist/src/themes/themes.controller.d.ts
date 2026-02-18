import { RequestUser } from '../common/interfaces/request-user.interface';
import { ThemesService } from './themes.service';
declare class ApplyThemeDto {
    preset: string;
    customJson?: Record<string, unknown>;
}
export declare class ThemesController {
    private readonly themesService;
    constructor(themesService: ThemesService);
    presets(): {
        key: string;
        name: string;
        description: string;
    }[];
    storeTheme(storeId: string): Promise<{
        theme: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            preset: string | null;
            customJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        presets: {
            key: string;
            name: string;
            description: string;
        }[];
    }>;
    apply(storeId: string, dto: ApplyThemeDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        preset: string | null;
        customJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
export {};
