import React from 'react';
import { formatCurrency } from '@/lib/format';
import Badge from './ui/Badge';
import { getStatusTrocas, type StatusTrocas } from '@/lib/performance';

export interface SectorData {
  id: number;
  nome: string;
  meta: number;
  realizado: number;
}

interface SectorsTableProps {
  sectors: SectorData[];
}

const statusLabels: Record<StatusTrocas, string> = {
  otimo: 'Ótimo',
  atencao: 'Atenção',
  acima: 'Acima',
  critico: 'Crítico',
  sem_lancamento: 'Sem lançamento',
};

const badgeVariants: Record<StatusTrocas, 'success' | 'warning' | 'error' | 'info'> = {
  otimo: 'success',
  atencao: 'warning',
  acima: 'error',
  critico: 'error',
  sem_lancamento: 'info',
};

export default function SectorsTable({ sectors }: SectorsTableProps) {
  let bestId = -1;
  let minPct = Infinity;
  let worstId = -1;
  let maxPct = -Infinity;

  sectors.forEach(s => {
    const pct = s.meta > 0 ? (s.realizado / s.meta) * 100 : 0;
    if (pct < minPct) { minPct = pct; bestId = s.id; }
    if (pct > maxPct) { maxPct = pct; worstId = s.id; }
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
          <tr>
            <th className="px-5 py-4">Setor</th>
            <th className="px-5 py-4 w-1/3">Realizado</th>
            <th className="px-5 py-4">Meta (Limite)</th>
            <th className="px-5 py-4">Diferença</th>
            <th className="px-5 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sectors.map((s, idx) => {
            const diferenca = s.realizado - s.meta;
            const pct       = s.meta > 0 ? (s.realizado / s.meta) * 100 : 0;
            const hasReport = s.realizado > 0 || diferenca !== -s.meta;
            const { status } = getStatusTrocas(s.realizado, s.meta, !hasReport);
            const isBom = diferenca <= 0;
            const barWidth  = Math.min(Math.max(pct, 0), 100);

            return (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: 'forwards' }}>
                <td className="px-5 py-5 font-medium text-[#1f2937]">{s.nome}</td>

                <td className="px-5 py-4 min-w-[220px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#1f2937] font-medium">{formatCurrency(s.realizado)}</span>
                    <span className={`text-xs font-bold ml-4 ${isBom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isBom ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </td>

                <td className="px-5 py-5 text-[#6b7280]">{formatCurrency(s.meta)}</td>

                <td className={`px-5 py-5 font-bold ${isBom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                  {diferenca > 0 ? '+' : ''}{formatCurrency(diferenca)}
                </td>

                <td className="px-5 py-5 text-center">
                  {s.id === worstId && sectors.length > 1 && maxPct > 100 ? (
                    <Badge variant="error" size="sm">Crítico</Badge>
                  ) : s.id === bestId && sectors.length > 1 ? (
                    <Badge variant="warning" size="sm">Melhor</Badge>
                  ) : (
                    <Badge variant={badgeVariants[status]} size="sm">
                      {statusLabels[status]}
                    </Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
