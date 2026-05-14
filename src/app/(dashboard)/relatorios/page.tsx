import RelatoriosClient from './RelatoriosClient';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db';
import { daily_reports } from '@/db/schema';
import { sql } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Relatórios | Prado Trocas",
  description: "Relatórios históricos de trocas por setor.",
};

const FALLBACK_DATES = ['2026-05-13', '2026-05-12', '2026-05-09'];

export default async function RelatoriosPage() {
  let availableDates: string[] = FALLBACK_DATES;

  try {
    const env = getRequestContext().env as { DB?: D1Database };
    if (env?.DB) {
      const db = getDb(env.DB);
      const datesResult = await db.select({ date: daily_reports.date })
        .from(daily_reports)
        .groupBy(daily_reports.date)
        .orderBy(sql`${daily_reports.date} DESC`);

      const fetchedDates = datesResult.map(r => r.date as string);
      if (fetchedDates.length > 0) {
        availableDates = fetchedDates;
      }
    }
  } catch {
    availableDates = FALLBACK_DATES;
  }

  return <RelatoriosClient initialDates={availableDates} />;
}