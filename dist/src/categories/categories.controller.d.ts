import { RequestUser } from '../common/interfaces/request-user.interface';
import { CategoriesService } from './categories.service';
declare class CreateCategoryDto {
    name: string;
    slug: string;
}
declare class UpdateCategoryDto {
    name?: string;
    slug?: string;
}
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(storeId: string, dto: CreateCategoryDto, user: RequestUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }>;
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }[]>;
    update(storeId: string, categoryId: string, dto: UpdateCategoryDto, user: RequestUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }>;
    remove(storeId: string, categoryId: string, user: RequestUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }>;
}
export {};
