import { db } from '@/db';
import { sectors, daily_reports } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getTodayDate } from '@/lib/format';
import { calcularDiferenca, calcularPercentual, getStatusTrocas } from '@/lib/performance';

export async function getDashboardData() {
  const today = getTodayDate();

  const allSectors = await db.select().from(sectors);
  const todayReports = await db.select().from(daily_reports).where(eq(daily_reports.date, today));

  const sectorsWithData = allSectors.map(sector => {
    const report = todayReports.find(r => r.sector_id === sector.id);
    const realizado = report?.valor_realizado ?? 0;
    const meta = report?.valor_meta ?? sector.meta;
    const diferenca = calcularDiferenca(realizado, meta);
    const percentual = calcularPercentual(realizado, meta);
    const { status, color } = getStatusTrocas(realizado, meta);

    return {
      id: sector.id,
      nome: sector.nome,
      meta,
      realizado,
      diferenca,
      percentual,
      status,
      statusColor: color,
    };
  });

  return { sectors: sectorsWithData, date: today };
}