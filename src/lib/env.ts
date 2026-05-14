import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  DATABASE_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

function parseEnv(): z.infer<typeof envSchema> {
  const envVars: Record<string, string | undefined> = {
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_ID: process.env.DATABASE_ID,
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