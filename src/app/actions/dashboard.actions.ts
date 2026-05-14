import { db } from '@/db';
import { sectors, daily_reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

const FALLBACK_SECTORS = [
  { id: 1, nome: 'Açougue', meta: 15000, realizado: 14250 },
  { id: 2, nome: 'Bebidas', meta: 8000, realizado: 4800 },
  { id: 3, nome: 'Petshop', meta: 5000, realizado: 5600 },
  { id: 4, nome: 'Higiene', meta: 4000, realizado: 3920 },
  { id: 5, nome: 'Mercearia', meta: 13000, realizado: 13930 },
];

export async function getDashboardData() {
  const today = new Date().toISOString().split('T')[0];
  let sectorsWithData = FALLBACK_SECTORS;

  try {
    const allSectors = await db.select().from(sectors);
    const todayReports = await db.select().from(daily_reports).where(eq(daily_reports.date, today));

    sectorsWithData = allSectors.map(sector => {
      const report = todayReports.find(r => r.sector_id === sector.id);
      return {
        id: sector.id,
        nome: sector.nome,
        meta: report?.valor_meta ?? 0,
        realizado: report?.valor_realizado ?? 0,
      };
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    sectorsWithData = FALLBACK_SECTORS;
  }

  return { sectors: sectorsWithData, date: today };
}