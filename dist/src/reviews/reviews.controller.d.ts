import { RequestUser } from '../common/interfaces/request-user.interface';
import { ReviewsService } from './reviews.service';
declare class UpdateReviewApprovalDto {
    isApproved: boolean;
}
declare class ReviewListQueryDto {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
}
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    list(storeId: string, query: ReviewListQueryDto): Promise<{
        items: ({
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
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    approve(storeId: string, reviewId: string, dto: UpdateReviewApprovalDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        title: string | null;
        comment: string | null;
        isApproved: boolean;
    }>;
    remove(storeId: string, reviewId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        title: string | null;
        comment: string | null;
        isApproved: boolean;
    }>;
}
export {};
