'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/format';
import KPIGroup from '@/components/ui/KPICard';
import { CalendarIcon } from '@/components/icons';
import { useReportsByDate } from '@/hooks/useReports';

type Sector = {
  id: number;
  sector_nome?: string;
  nome?: string;
  meta: number;
  realizado: number;
};

interface RelatoriosClientProps {
  initialDates: string[];
}

export default function RelatoriosClient({ initialDates }: RelatoriosClientProps) {
  const [selectedDate, setSelectedDate] = useState(initialDates[0] || '');

  const { data: reports, isLoading } = useReportsByDate(selectedDate);

  const sectors: Sector[] = (reports as { sector: { id: number; nome: string }; report: { valor_realizado: number; valor_meta: number } }[])?.map(r => ({
    id: r.sector?.id ?? 0,
    nome: r.sector?.nome ?? '',
    meta: r.report?.valor_meta ?? 0,
    realizado: r.report?.valor_realizado ?? 0,
  })) ?? [];

  const totalMeta      = sectors.reduce((a, s) => a + s.meta, 0);
  const totalRealizado = sectors.reduce((a, s) => a + s.realizado, 0);
  const diferenca      = totalRealizado - totalMeta;

  const formatDateLabel = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Histórico</h1>
          <p className="text-sm text-[#6b7280] mt-0.5 capitalize">{formatDateLabel(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <CalendarIcon className="text-[#6b7280]" />
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent text-[#1f2937] text-sm font-medium focus:outline-none cursor-pointer"
          >
            {initialDates.map(d => {
              const [y, m, day] = d.split('-');
              return (
                <option key={d} value={d} className="bg-white">
                  {day}/{m}/{y}
                </option>
              );
            })}
          </select>
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

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1f2937]">Detalhamento por Setor</h2>
            <span className="text-xs text-[#6b7280] bg-gray-100 px-3 py-1 rounded-full">{sectors.length} setores</span>
          </div>
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
              {sectors.map(s => {
                const dif  = s.realizado - s.meta;
                const pct  = s.meta > 0 ? (s.realizado / s.meta) * 100 : 0;
                const bom  = dif <= 0;
                const barW = Math.min(pct, 100);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1f2937]">{s.nome}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[#1f2937] font-medium">{formatCurrency(s.realizado)}</span>
                        <span className={`text-xs font-bold ml-4 ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${bom ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6b7280]">{formatCurrency(s.meta)}</td>
                    <td className={`px-6 py-4 font-bold ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                      {dif > 0 ? '+' : ''}{formatCurrency(dif)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td className="px-6 py-4 text-xs font-bold text-[#6b7280] uppercase tracking-wide">Total</td>
                <td className="px-6 py-4 font-bold text-[#1f2937]">{formatCurrency(totalRealizado)}</td>
                <td className="px-6 py-4 font-bold text-[#6b7280]">{formatCurrency(totalMeta)}</td>
                <td className={`px-6 py-4 font-bold ${diferenca <= 0 ? 'text-[#16a34a]' : 'text-red-600'}`}>
                  {diferenca > 0 ? '+' : ''}{formatCurrency(diferenca)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}