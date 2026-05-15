'use client';

import React, { useState } from 'react';
import { formatCurrency, getTodayDate } from '@/lib/format';
import KPIGroup from '@/components/ui/KPICard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SectorsIcon } from '@/components/icons';
import { useReportsHistory } from '@/hooks/useReports';

type Sector = {
  id: number;
  sector_nome?: string;
  nome?: string;
  meta: number;
  realizado: number;
};

interface MeusSetoresClientProps {
  userSetores: number[];
  isAdmin: boolean;
}

export default function MeusSetoresClient({ userSetores, isAdmin }: MeusSetoresClientProps) {
  const [selectedDate] = useState('today');

  const { data: historyData, isLoading } = useReportsHistory();

  const today = getTodayDate();

  const getSectorsByDate = (dateKey: string): Sector[] => {
    if (!historyData) return [];

    const filtered = historyData.filter((r: unknown) => {
      const report = (r as { report: { date: string } }).report;
      if (dateKey === 'today') return report?.date === today;
      return report?.date === dateKey;
    });

    const sectorsMap = new Map<number, Sector>();
    for (const r of filtered as { sector: { id: number; nome: string }; report: { date: string; valor_realizado: number; valor_meta: number } }[]) {
      const sectorId = r.sector?.id;
      const sectorNome = r.sector?.nome;
      const reportData = r.report;
      
      if (isAdmin || userSetores.length === 0 || (sectorId && userSetores.includes(sectorId))) {
        sectorsMap.set(sectorId, {
          id: sectorId,
          nome: sectorNome,
          meta: reportData?.valor_meta ?? 0,
          realizado: reportData?.valor_realizado ?? 0,
        });
      }
    }

    return Array.from(sectorsMap.values());
  };

  const dateKey = selectedDate === 'today' ? today : selectedDate;
  const sectors = getSectorsByDate(dateKey);
  const totalMeta = sectors.reduce((a, s) => a + s.meta, 0);
  const totalRealizado = sectors.reduce((a, s) => a + s.realizado, 0);
  const isToday = selectedDate === 'today';

  const formatDateLabel = (iso: string) => {
    const [y, m, day] = iso.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Meus Setores</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {isAdmin ? 'Visão de todos os setores.' : userSetores.length > 0 ? `${userSetores.length} setor${userSetores.length > 1 ? 'es' : ''} atribuído${userSetores.length > 1 ? 's' : ''}.` : 'Nenhum setor atribuído.'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <KPIGroup realizado={totalRealizado} meta={totalMeta} />
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1f2937]">Desempenho</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                {isToday ? 'Visão do dia atual.' : `Histórico — ${formatDateLabel(selectedDate)}`}
              </p>
            </div>
            {isToday && (
              <Badge variant="warning" size="sm">Ao vivo</Badge>
            )}
          </div>

          {sectors.length === 0 ? (
            <EmptyState
              icon={<SectorsIcon />}
              title="Nenhum setor atribuído a este usuário."
            />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Setor</th>
                  <th className="px-6 py-4">Realizado</th>
                  <th className="px-6 py-4">Meta</th>
                  <th className="px-6 py-4">Diferença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sectors.map((s, idx) => {
                  const dif = s.realizado - s.meta;
                  const pct = s.meta > 0 ? (s.realizado / s.meta) * 100 : 0;
                  const pos = dif >= 0;
                  const barW = Math.min(pct, 100);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${0.2 + idx * 0.06}s`, animationFillMode: 'forwards' }}>
                      <td className="px-6 py-4 font-semibold text-[#1f2937]">{s.nome}</td>
                      <td className="px-6 py-4 min-w-[180px]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[#1f2937] font-medium">{formatCurrency(s.realizado)}</span>
                          <span className={`text-xs font-bold ml-4 ${pos ? 'text-[#16a34a]' : 'text-red-600'}`}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pos ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                            style={{ width: `${barW}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6b7280]">{formatCurrency(s.meta)}</td>
                      <td className={`px-6 py-4 font-bold ${pos ? 'text-[#16a34a]' : 'text-red-600'}`}>{pos ? '+' : ''}{formatCurrency(dif)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}