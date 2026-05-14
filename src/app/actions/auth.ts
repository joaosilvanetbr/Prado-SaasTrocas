'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getJwtSecret } from '@/lib/env';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório').max(100),
  password: z.string().min(1, 'Senha é obrigatória').max(100),
});

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

function queryLocalDb(sql: string, params: string[]) {
  try {
    const stateDir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
    if (!fs.existsSync(stateDir)) return [];
    const files = fs.readdirSync(stateDir);
    const dbFile = files.find((f) => f.endsWith('.sqlite') && !f.includes('-shm') && !f.includes('-wal'));
    if (!dbFile) return [];
    const dbPath = path.join(stateDir, dbFile);
    const sqlite = new Database(dbPath);
    const stmt = sqlite.prepare(sql);
    return stmt.all(...params);
  } catch {
    return [];
  }
}

interface DbUser {
  id: number;
  nome: string;
  password_hash: string;
  role: string;
  setores: string;
}

interface User {
  id: number;
  nome: string;
  password_hash: string;
  roles: string[];
  setores: number[];
}

export async function loginAction(formData: FormData) {
  const ip = 'unknown';

  if (!checkRateLimit(ip)) {
    return { error: 'Muitas tentativas. Tente novamente em alguns minutos.' };
  }

  const rawData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };

  const parseResult = loginSchema.safeParse(rawData);
  if (!parseResult.success) {
    return { error: 'Dados inválidos. Verifique os campos e tente novamente.' };
  }

  const { username, password } = parseResult.data;

  let user: User | null = null;

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    const db = getDb(env.DB!);
    const userList = await db.select().from(users).where(eq(users.nome, username)).limit(1);

    if (userList.length > 0) {
      const userFromDb = userList[0] as DbUser;
      user = {
        id: userFromDb.id,
        nome: userFromDb.nome,
        password_hash: userFromDb.password_hash,
        roles: (userFromDb.role || '').split(',').map((r: string) => r.trim()).filter(Boolean),
        setores: (userFromDb.setores || '').split(',').filter(Boolean).map(Number),
      };
    }
  } catch {
    const results = queryLocalDb('SELECT * FROM users WHERE nome = ? LIMIT 1', [username]) as DbUser[];
    if (results.length > 0) {
      const resultFromDb = results[0];
      user = {
        id: resultFromDb.id,
        nome: resultFromDb.nome,
        password_hash: resultFromDb.password_hash,
        roles: (resultFromDb.role || '').split(',').map((r: string) => r.trim()).filter(Boolean),
        setores: (resultFromDb.setores || '').split(',').filter(Boolean).map(Number),
      };
    }
  }

  if (!user) {
    return { error: 'Credenciais inválidas.' };
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return { error: 'Credenciais inválidas.' };
  }

  const token = await new SignJWT({
    sub: user.id.toString(),
    nome: user.nome,
    roles: user.roles,
    setores: user.setores,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return { success: true, roles: user.roles };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}