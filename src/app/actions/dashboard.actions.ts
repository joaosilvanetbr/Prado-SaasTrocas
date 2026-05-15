import { db } from '@/db';
import { sectors, daily_reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getDashboardData() {
  const today = new Date().toISOString().split('T')[0];

  const allSectors = await db.select().from(sectors);
  const todayReports = await db.select().from(daily_reports).where(eq(daily_reports.date, today));

  const sectorsWithData = allSectors.map(sector => {
    const report = todayReports.find(r => r.sector_id === sector.id);
    return {
      id: sector.id,
      nome: sector.nome,
      meta: report?.valor_meta ?? 0,
      realizado: report?.valor_realizado ?? 0,
    };
  });

  return { sectors: sectorsWithData, date: today };
}