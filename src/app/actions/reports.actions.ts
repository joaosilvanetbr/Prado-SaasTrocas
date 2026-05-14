'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db';
import { daily_reports, sectors } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';

const sectorReportSchema = z.object({
  sector_id: z.number().int().positive(),
  valor_realizado: z.number().min(0),
  valor_meta: z.number().min(0),
});

const saveDailyReportSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  sectors: z.array(sectorReportSchema),
});

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function saveDailyReportAction(date: string, sectorsData: { sector_id: number; valor_realizado: number; valor_meta: number }[]) {
  const parseResult = saveDailyReportSchema.safeParse({ date, sectors: sectorsData });
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);

    for (const s of parseResult.data.sectors) {
      await db.delete(daily_reports).where(
        and(eq(daily_reports.date, date), eq(daily_reports.sector_id, s.sector_id))
      );
      await db.insert(daily_reports).values({
        date,
        sector_id: s.sector_id,
        valor_realizado: s.valor_realizado,
        valor_meta: s.valor_meta,
      });
    }
    return { success: true };
  } catch {
    return { error: 'Erro ao salvar relatório' };
  }
}

export async function getReportsByDateAction(date: string) {
  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    const result = await db.select({
      report: daily_reports,
      sector: sectors,
    }).from(daily_reports).leftJoin(sectors, eq(daily_reports.sector_id, sectors.id))
      .where(eq(daily_reports.date, date));
    return { success: true, reports: result };
  } catch {
    return { error: 'Database unavailable' };
  }
}

export async function getReportsHistoryAction(startDate?: string, endDate?: string) {
  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (!env.DB) return { error: 'Database not configured' };

    const db = getDb(env.DB);
    let result;

    if (startDate && endDate) {
      result = await db.select({
        report: daily_reports,
        sector: sectors,
      }).from(daily_reports).leftJoin(sectors, eq(daily_reports.sector_id, sectors.id))
        .where(and(gte(daily_reports.date, startDate), lte(daily_reports.date, endDate)))
        .orderBy(daily_reports.date);
    } else if (startDate) {
      result = await db.select({
        report: daily_reports,
        sector: sectors,
      }).from(daily_reports).leftJoin(sectors, eq(daily_reports.sector_id, sectors.id))
        .where(gte(daily_reports.date, startDate))
        .orderBy(daily_reports.date);
    } else if (endDate) {
      result = await db.select({
        report: daily_reports,
        sector: sectors,
      }).from(daily_reports).leftJoin(sectors, eq(daily_reports.sector_id, sectors.id))
        .where(lte(daily_reports.date, endDate))
        .orderBy(daily_reports.date);
    } else {
      result = await db.select({
        report: daily_reports,
        sector: sectors,
      }).from(daily_reports).leftJoin(sectors, eq(daily_reports.sector_id, sectors.id))
        .orderBy(daily_reports.date);
    }
    return { success: true, reports: result };
  } catch {
    return { error: 'Database unavailable' };
  }
}

export async function getTodayReportsAction() {
  return getReportsByDateAction(getTodayDate());
}