'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getJwtSecret } from '@/lib/env';

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
    const userList = await db.select().from(users).where(eq(users.nome, username)).limit(1);

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