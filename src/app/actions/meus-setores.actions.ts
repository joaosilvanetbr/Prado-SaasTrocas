'use server';

import { db } from '@/db';
import { sectors, daily_reports } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret, getTodayDate } from '@/lib/format';
import { calcularDiferenca, calcularPercentual, getStatusTrocas, type StatusTrocas } from '@/lib/performance';

type StatusVariant = 'success' | 'warning' | 'error' | 'info';

function getStatusVariant(status: StatusTrocas): StatusVariant {
  switch (status) {
    case 'otimo': return 'success';
    case 'atencao': return 'warning';
    case 'acima':
    case 'critico': return 'error';
    case 'sem_lancamento': return 'info';
    default: return 'info';
  }
}

export async function getMySectorsData(date?: string) {
  try {
    const targetDate = date || getTodayDate();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: 'Não autenticado', sectors: [] };
    }

    const verified = await jwtVerify(token, getJwtSecret());
    const payload = verified.payload as { sub?: string; roles?: string[]; setores?: number[] };

    const userRoles: string[] = payload?.roles || [];
    const userSetores: number[] = payload?.setores || [];
    const isAdmin = userRoles.includes('admin');

    const allSectors = await db.select().from(sectors);
    const todayReports = await db.select().from(daily_reports).where(eq(daily_reports.date, targetDate));

    let filteredSectors = allSectors;
    if (!isAdmin && userSetores.length > 0) {
      filteredSectors = allSectors.filter(s => userSetores.includes(s.id));
    }

    const sectorsData = filteredSectors.map(sector => {
      const report = todayReports.find(r => r.sector_id === sector.id);
      const hasReport = !!report;
      const realizado = report?.valor_realizado ?? 0;
      const meta = report?.valor_meta ?? sector.meta;
      const diferenca = calcularDiferenca(realizado, meta);
      const percentual = calcularPercentual(realizado, meta);
      const { status, color } = getStatusTrocas(realizado, meta, !hasReport);

      return {
        id: sector.id,
        nome: sector.nome,
        meta,
        realizado,
        diferenca,
        percentual,
        status,
        statusVariant: getStatusVariant(status),
        hasReport,
      };
    });

    return { success: true, sectors: sectorsData };
  } catch (error) {
    console.error('Error getting my sectors data:', error);
    return { error: 'Erro ao buscar dados dos setores', sectors: [] };
  }
}