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
});

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
