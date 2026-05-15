import RelatoriosClient from './RelatoriosClient';
import { db } from '@/db';
import { daily_reports } from '@/db/schema';
import { sql } from 'drizzle-orm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Relatórios | Prado Trocas",
  description: "Relatórios históricos de trocas por setor.",
};

export default async function RelatoriosPage() {
  const datesResult = await db.select({ date: daily_reports.date })
    .from(daily_reports)
    .groupBy(daily_reports.date)
    .orderBy(sql`${daily_reports.date} DESC`);

  const availableDates = datesResult.map(r => r.date as string);

  return <RelatoriosClient initialDates={availableDates} />;
}