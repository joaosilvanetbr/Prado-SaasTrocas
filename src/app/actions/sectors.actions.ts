'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db';
import { sectors, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';

const createSectorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  comprador_id: z.number().int().positive().nullable().optional(),
});

const updateSectorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
  comprador_id: z.number().int().positive().nullable().optional(),
});

export async function createSectorAction(formData: FormData) {
  const rawData = {
    nome: formData.get('nome') as string,
    comprador_id: formData.get('comprador_id') as string || '',
  };

  const parseResult = createSectorSchema.safeParse({
    nome: rawData.nome,
    comprador_id: rawData.comprador_id ? parseInt(rawData.comprador_id) : null,
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  const { nome, comprador_id } = parseResult.data;

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const result = await db.insert(sectors).values({ nome, comprador_id }).returning();
    return { success: true, sector: result[0] };
  } catch {
    return { error: 'Erro ao criar setor' };
  }
}

export async function listSectorsAction() {
  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const result = await db.select().from(sectors);
    return { success: true, sectors: result };
  } catch {
    return { error: 'Database unavailable' };
  }
}

export async function listSectorsWithCompradorAction() {
  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const result = await db.select({
      sector: sectors,
      comprador: users,
    }).from(sectors).leftJoin(users, eq(sectors.comprador_id, users.id));
    return { success: true, sectors: result };
  } catch {
    return { error: 'Database unavailable' };
  }
}

export async function updateSectorAction(id: number, data: Record<string, unknown>) {
  const parseResult = updateSectorSchema.safeParse(data);
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const updateData: Record<string, unknown> = {};
    if (parseResult.data.nome !== undefined) updateData.nome = parseResult.data.nome;
    if (parseResult.data.comprador_id !== undefined) updateData.comprador_id = parseResult.data.comprador_id;

    await db.update(sectors).set(updateData).where(eq(sectors.id, id));
    return { success: true };
  } catch {
    return { error: 'Erro ao atualizar setor' };
  }
}

export async function deleteSectorAction(id: number) {
  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    await db.delete(sectors).where(eq(sectors.id, id));
    return { success: true };
  } catch {
    return { error: 'Erro ao deletar setor' };
  }
}