'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';

const createUserSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100),
  role: z.string().min(1, 'Cargo é obrigatório'),
  setores: z.string().default(''),
});

const updateUserSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.string().min(1, 'Cargo é obrigatório').optional(),
  setores: z.string().optional(),
  ativo: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres').max(100),
});

export async function createUserAction(formData: FormData) {
  const rawData = {
    nome: formData.get('nome') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as string,
    setores: formData.get('setores') as string || '',
  };

  const parseResult = createUserSchema.safeParse(rawData);
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  const { nome, email, password, role, setores } = parseResult.data;

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return { error: 'Email já cadastrado' };
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({ nome, email, password_hash, role, setores }).returning();
    return { success: true, user: result[0] };
  } catch {
    return { error: 'Erro ao criar usuário' };
  }
}

export async function listUsersAction() {
  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const result = await db.select().from(users);
    return { success: true, users: result };
  } catch {
    return { error: 'Database unavailable' };
  }
}

export async function updateUserAction(id: number, data: Record<string, unknown>) {
  const parseResult = updateUserSchema.safeParse(data);
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const updateData: Record<string, unknown> = {};
    if (parseResult.data.nome !== undefined) updateData.nome = parseResult.data.nome;
    if (parseResult.data.email !== undefined) updateData.email = parseResult.data.email;
    if (parseResult.data.role !== undefined) updateData.role = parseResult.data.role;
    if (parseResult.data.setores !== undefined) updateData.setores = parseResult.data.setores;

    await db.update(users).set(updateData).where(eq(users.id, id));
    return { success: true };
  } catch {
    return { error: 'Erro ao atualizar usuário' };
  }
}

export async function deleteUserAction(id: number) {
  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  } catch {
    return { error: 'Erro ao deletar usuário' };
  }
}

export async function updatePasswordAction(id: number, oldPassword: string, newPassword: string) {
  const parseResult = updatePasswordSchema.safeParse({ oldPassword, newPassword });
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const userList = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (userList.length === 0) return { error: 'Usuário não encontrado' };

    const user = userList[0];
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) return { error: 'Senha atual incorreta' };

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password_hash: newHash }).where(eq(users.id, id));
    return { success: true };
  } catch {
    return { error: 'Erro ao atualizar senha' };
  }
}