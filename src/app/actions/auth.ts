'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getJwtSecret } from '@/lib/env';
import { sanitizeUsername } from '@/lib/sanitize';

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório').max(100),
  password: z.string().min(1, 'Senha é obrigatória').max(100),
});

// ============================================
// RATE LIMITING (Serverless-Safe)
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstAttempt: number;
}

// In-memory store (útil para desenvolvimento, mas em produção usar KV externo)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Limite de tentativas por janela de tempo
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto

function getRateLimitKey(ip: string): string {
  return `login:${ip}`;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = getRateLimitKey(ip);
  const entry = rateLimitStore.get(key);

  // Limpar entradas antigas periodicamente (cleanup básico)
  if (rateLimitStore.size > 1000) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS * 2;
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.firstAttempt < cutoff) {
        rateLimitStore.delete(k);
      }
    }
  }

  // Nova janela de rate limit
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS, firstAttempt: now });
    return true;
  }

  // Verificar limite
  if (entry.count >= RATE_LIMIT_MAX) {
    const waitSeconds = Math.ceil((entry.resetAt - now) / 1000);
    console.warn(`[RateLimit] IP ${ip} limitado. Aguarde ${waitSeconds}s`);
    return false;
  }

  entry.count++;
  return true;
}

function getRemainingAttempts(ip: string): number {
  const key = getRateLimitKey(ip);
  const entry = rateLimitStore.get(key);
  if (!entry || Date.now() > entry.resetAt) {
    return RATE_LIMIT_MAX;
  }
  return Math.max(0, RATE_LIMIT_MAX - entry.count);
}

function getRetryAfterSeconds(ip: string): number {
  const key = getRateLimitKey(ip);
  const entry = rateLimitStore.get(key);
  if (!entry) return 0;
  const remaining = Math.ceil((entry.resetAt - Date.now()) / 1000);
  return Math.max(0, remaining);
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

  // Sanitizar username antes de usar
  const sanitizedUsername = sanitizeUsername(username);

  let user: User | null = null;

  try {
    const userList = await db.select().from(users).where(sql`${users.nome} ILIKE ${sanitizedUsername}`).limit(1);

    if (userList.length > 0) {
      const userFromDb = userList[0];
      user = {
        id: userFromDb.id,
        nome: userFromDb.nome,
        password_hash: userFromDb.password_hash,
        roles: (userFromDb.role || '').split(',').map((r: string) => r.trim()).filter(Boolean),
        setores: (userFromDb.setores || '').split(',').filter(Boolean).map(Number),
      };
    }
  } catch (error) {
    console.error('Database error:', error);
    return { error: 'Erro ao conectar ao banco de dados.' };
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