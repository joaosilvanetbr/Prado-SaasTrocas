'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-default-key');

interface DemoUser {
  id: number;
  nome: string;
  password_hash: string;
  roles: string[];
  setores: number[];
}

const DEMO_USERS: DemoUser[] = [
  { id: 1, nome: 'Carlos Silva',  password_hash: 'demo123', roles: ['admin'],     setores: [] },
  { id: 2, nome: 'Mariana Rocha', password_hash: 'demo123', roles: ['gerente'],   setores: [1, 2] },
  { id: 3, nome: 'Ana Souza',      password_hash: 'demo123', roles: ['comprador'], setores: [1, 4] },
  { id: 4, nome: 'Fernando Pinto', password_hash: 'demo123', roles: ['comprador'], setores: [1, 4] },
  { id: 5, nome: 'Ricardo Lima',   password_hash: 'demo123', roles: ['comprador'], setores: [3] },
  { id: 6, nome: 'Patrícia Moura',  password_hash: 'demo123', roles: ['gerente', 'comprador'], setores: [2, 5] },
];

function queryLocalDb(sql: string, params: string[]) {
  const stateDir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
  if (!fs.existsSync(stateDir)) return [];
  const files = fs.readdirSync(stateDir);
  const dbFile = files.find((f: string) => f.endsWith('.sqlite') && !f.includes('-shm') && !f.includes('-wal'));
  if (!dbFile) return [];
  const dbPath = path.join(stateDir, dbFile as string);
  const sqlite = new Database(dbPath);
  const stmt = sqlite.prepare(sql);
  return stmt.all(...params);
}

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Nome de usuário e senha são obrigatórios.' };
  }

  let user = DEMO_USERS.find(u => u.nome === username);

  if (!user) {
    try {
      const env = getRequestContext().env as any;
      const db = getDb(env.DB);
      const userList = await db.select().from(users).where(eq(users.nome, username)).limit(1);
      if (userList.length > 0) {
        const userFromDb = userList[0] as any;
        user = {
          id: userFromDb.id,
          nome: userFromDb.nome,
          password_hash: 'from-db',
          roles: (userFromDb.role as string || '').split(',').map((r: string) => r.trim()).filter(Boolean),
          setores: (userFromDb.setores as string || '').split(',').filter(Boolean).map(Number),
        };
      }
    } catch {
      const results = queryLocalDb('SELECT * FROM users WHERE nome = ? LIMIT 1', [username]) as any[];
      if (results.length > 0) {
        const resultFromDb = results[0] as any;
        user = {
          id: resultFromDb.id,
          nome: resultFromDb.nome,
          password_hash: 'from-db',
          roles: (resultFromDb.role as string || '').split(',').map((r: string) => r.trim()).filter(Boolean),
          setores: (resultFromDb.setores as string || '').split(',').filter(Boolean).map(Number),
        };
      }
    }
  }

  if (!user) {
    return { error: 'Nome de usuário ou senha inválidos.' };
  }

  const isValidPassword = user.password_hash === password || user.password_hash === 'from-db';
  if (!isValidPassword) {
    return { error: 'Nome de usuário ou senha inválidos.' };
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
    .sign(JWT_SECRET);

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