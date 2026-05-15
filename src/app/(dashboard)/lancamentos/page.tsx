import LancamentosClient from './LancamentosClient';
import { db } from '@/db';
import { sectors, daily_reports } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { getTodayDate } from '@/lib/format';

export const metadata: Metadata = {
  title: "Lançamentos | Prado Trocas",
  description: "Lançamentos de trocas diárias por setor.",
};

export default async function LancamentosPage() {
  const today = getTodayDate();

  const allSectors = await db.select().from(sectors);
  const todayReports = await db.select().from(daily_reports).where(eq(daily_reports.date, today));

  const sectorsWithData = allSectors.map(sector => {
    const report = todayReports.find(r => r.sector_id === sector.id);
    return {
      id: sector.id,
      nome: sector.nome,
      meta: report?.valor_meta ?? (sector.meta || 0),
      realizado: report?.valor_realizado ?? 0,
    };
  });

  return <LancamentosClient initialSectors={sectorsWithData} date={today} />;
}