'use server';

import { db } from '@/db';
import { sectors, users, daily_reports } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createSectorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  meta: z.number().min(0).default(0),
  comprador_id: z.number().int().positive().nullable().optional(),
});

const updateSectorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
  meta: z.number().min(0).optional(),
  comprador_id: z.number().int().positive().nullable().optional(),
});

export async function createSectorAction(formData: FormData) {
  const rawData = {
    nome: formData.get('nome') as string,
    meta: formData.get('meta') as string || '0',
    comprador_id: formData.get('comprador_id') as string || '',
  };

  const parseResult = createSectorSchema.safeParse({
    nome: rawData.nome,
    meta: rawData.meta ? parseFloat(rawData.meta) : 0,
    comprador_id: rawData.comprador_id ? parseInt(rawData.comprador_id) : null,
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  const { nome, meta, comprador_id } = parseResult.data;

  try {
    const result = await db.insert(sectors).values({ nome, meta, comprador_id }).returning();
    return { success: true, sector: result[0] };
  } catch (error) {
    console.error('Error creating sector:', error);
    return { error: 'Erro ao criar setor' };
  }
}

export async function listSectorsAction() {
  try {
    const result = await db.select().from(sectors);
    return { success: true, sectors: result };
  } catch (error) {
    console.error('Error listing sectors:', error);
    return { error: 'Database unavailable' };
  }
}

export async function listSectorsWithCompradorAction() {
  try {
    const result = await db.select({
      sector: sectors,
      comprador: users,
    }).from(sectors).leftJoin(users, eq(sectors.comprador_id, users.id));
    return { success: true, sectors: result };
  } catch (error) {
    console.error('Error listing sectors with comprador:', error);
    return { error: 'Database unavailable' };
  }
}

export async function updateSectorAction(id: number, data: Record<string, unknown>) {
  const parseResult = updateSectorSchema.safeParse(data);
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (parseResult.data.nome !== undefined) updateData.nome = parseResult.data.nome;
    if (parseResult.data.meta !== undefined) updateData.meta = parseResult.data.meta;
    if (parseResult.data.comprador_id !== undefined) updateData.comprador_id = parseResult.data.comprador_id;

    await db.update(sectors).set(updateData).where(eq(sectors.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error updating sector:', error);
    return { error: 'Erro ao atualizar setor' };
  }
}

export async function deleteSectorAction(id: number) {
  try {
    // Check if there are any daily_reports linked to this sector
    const reports = await db.select().from(daily_reports).where(eq(daily_reports.sector_id, id)).limit(1);
    if (reports.length > 0) {
      return { error: 'Não é possível excluir este departamento porque existem lançamentos vinculados a ele.' };
    }

    await db.delete(sectors).where(eq(sectors.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting sector:', error);
    return { error: 'Erro ao deletar setor' };
  }
}
