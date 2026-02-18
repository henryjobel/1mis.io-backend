import { RequestUser } from '../common/interfaces/request-user.interface';
import { ReviewsService } from './reviews.service';
declare class UpdateReviewApprovalDto {
    isApproved: boolean;
}
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<({
        product: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        title: string | null;
        isApproved: boolean;
        userId: string | null;
        customer: string | null;
        rating: number;
        comment: string | null;
    })[]>;
    approve(storeId: string, reviewId: string, dto: UpdateReviewApprovalDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        title: string | null;
        isApproved: boolean;
        userId: string | null;
        customer: string | null;
        rating: number;
        comment: string | null;
    }>;
    remove(storeId: string, reviewId: string, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        title: string | null;
        isApproved: boolean;
        userId: string | null;
        customer: string | null;
        rating: number;
        comment: string | null;
    }>;
}
export {};
