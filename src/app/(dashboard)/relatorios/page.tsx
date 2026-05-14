import RelatoriosClient from './RelatoriosClient';
import { db } from '@/db';
import { daily_reports } from '@/db/schema';
import { sql } from 'drizzle-orm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Relatórios | Prado Trocas",
  description: "Relatórios históricos de trocas por setor.",
};

const FALLBACK_DATES = ['2026-05-13', '2026-05-12', '2026-05-09'];

export default async function RelatoriosPage() {
  let availableDates: string[] = FALLBACK_DATES;

  try {
    const datesResult = await db.select({ date: daily_reports.date })
      .from(daily_reports)
      .groupBy(daily_reports.date)
      .orderBy(sql`${daily_reports.date} DESC`);

    const fetchedDates = datesResult.map(r => r.date as string);
    if (fetchedDates.length > 0) {
      availableDates = fetchedDates;
    }
  } catch {
    availableDates = FALLBACK_DATES;
  }

  return <RelatoriosClient initialDates={availableDates} />;
}