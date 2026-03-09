import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  GEMINI_PROJECT_NAME: z.string().optional(),
  GEMINI_PROJECT_NUMBER: z.string().optional(),
  GEMINI_PROJECT_ID: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  BACKEND_PUBLIC_URL: z.string().url().optional(),
  OWNER_APP_PUBLIC_URL: z.string().url().optional(),
  OWNER_DASHBOARD_BILLING_URL: z.string().url().optional(),
  SSLCOMMERZ_STORE_ID: z.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional(),
  SSLCOMMERZ_WEBHOOK_SECRET: z.string().optional(),
  SSLCOMMERZ_API_BASE_URL: z.string().url().optional(),
  SSLCOMMERZ_INIT_PATH: z.string().optional(),
  SSLCOMMERZ_VALIDATION_API_BASE_URL: z.string().url().optional(),
  SSLCOMMERZ_VALIDATION_API_PATH: z.string().optional(),
  SSLCOMMERZ_SUCCESS_URL: z.string().url().optional(),
  SSLCOMMERZ_FAIL_URL: z.string().url().optional(),
  SSLCOMMERZ_CANCEL_URL: z.string().url().optional(),
  SSLCOMMERZ_IPN_URL: z.string().url().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
