import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = ReturnType<typeof drizzle>;

const connectionString = process.env.DATABASE_URL!;

// ============================================
// CONFIGURAÇÃO DO POOL DE CONEXÕES
// ============================================

const isProduction = process.env.NODE_ENV === 'production';

export const postgresClient = postgres(connectionString, {
  // Em produção,允许多个连接以处理并发请求
  // Em desenvolvimento, usar menos conexões para economizar recursos
  max: isProduction ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 15,
  ssl: 'require',
  keep_alive: 30000,
  max_lifetime: 60 * 30, // 30 minutos
});

console.log(`[DB] Pool configurado: max=${isProduction ? 10 : 3}, ssl=require`);

export const db = drizzle(postgresClient, { schema });

export function getDb() {
  return db;
}
