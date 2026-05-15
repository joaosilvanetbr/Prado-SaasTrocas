import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

function parseEnv(): z.infer<typeof envSchema> {
  const envVars: Record<string, string | undefined> = {
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  const result = envSchema.safeParse(envVars);
  
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Invalid environment variables: ${errors}`);
  }

  return result.data;
}

export const env = parseEnv();

export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}