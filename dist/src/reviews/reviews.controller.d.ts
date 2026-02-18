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
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        title: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        comment: string | null;
        isApproved: boolean;
    })[]>;
    approve(storeId: string, reviewId: string, dto: UpdateReviewApprovalDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        title: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        comment: string | null;
        isApproved: boolean;
    }>;
    remove(storeId: string, reviewId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        title: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        comment: string | null;
        isApproved: boolean;
    }>;
}
export {};
