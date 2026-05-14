import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbId: 'ae26e687276cddf49fae4e330b4c482d',
} satisfies Config;
