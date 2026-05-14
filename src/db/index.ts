import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema';

export type Database = ReturnType<typeof drizzle>;

export function getDb(envDB: D1Database) {
  return drizzle(envDB, { schema });
}

export function getLocalDb(sqlite: unknown) {
  return drizzle(sqlite as D1Database, { schema });
}
