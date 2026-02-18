export declare function validateEnv(config: Record<string, unknown>): {
    PORT: number;
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    GEMINI_MODEL: string;
    GEMINI_API_KEY?: string | undefined;
    GEMINI_PROJECT_NAME?: string | undefined;
    GEMINI_PROJECT_NUMBER?: string | undefined;
    GEMINI_PROJECT_ID?: string | undefined;
    WEBHOOK_SECRET?: string | undefined;
};
