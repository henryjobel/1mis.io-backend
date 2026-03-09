"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(4000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(8),
    JWT_REFRESH_SECRET: zod_1.z.string().min(8),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    GEMINI_MODEL: zod_1.z.string().default('gemini-1.5-flash'),
    GEMINI_PROJECT_NAME: zod_1.z.string().optional(),
    GEMINI_PROJECT_NUMBER: zod_1.z.string().optional(),
    GEMINI_PROJECT_ID: zod_1.z.string().optional(),
    WEBHOOK_SECRET: zod_1.z.string().optional(),
    BACKEND_PUBLIC_URL: zod_1.z.string().url().optional(),
    OWNER_APP_PUBLIC_URL: zod_1.z.string().url().optional(),
    OWNER_DASHBOARD_BILLING_URL: zod_1.z.string().url().optional(),
    SSLCOMMERZ_STORE_ID: zod_1.z.string().optional(),
    SSLCOMMERZ_STORE_PASSWORD: zod_1.z.string().optional(),
    SSLCOMMERZ_WEBHOOK_SECRET: zod_1.z.string().optional(),
    SSLCOMMERZ_API_BASE_URL: zod_1.z.string().url().optional(),
    SSLCOMMERZ_INIT_PATH: zod_1.z.string().optional(),
    SSLCOMMERZ_VALIDATION_API_BASE_URL: zod_1.z.string().url().optional(),
    SSLCOMMERZ_VALIDATION_API_PATH: zod_1.z.string().optional(),
    SSLCOMMERZ_SUCCESS_URL: zod_1.z.string().url().optional(),
    SSLCOMMERZ_FAIL_URL: zod_1.z.string().url().optional(),
    SSLCOMMERZ_CANCEL_URL: zod_1.z.string().url().optional(),
    SSLCOMMERZ_IPN_URL: zod_1.z.string().url().optional(),
});
function validateEnv(config) {
    return envSchema.parse(config);
}
//# sourceMappingURL=env.validation.js.map