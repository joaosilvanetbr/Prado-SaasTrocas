'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDateBR, formatInputDate } from '@/lib/format';
import { KPICard } from '@/components/ui/KPICard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import * as client from '@/app/actions/reports.actions';

export default function RelatoriosClient() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStart, setAppliedStart] = useState('');
  const [appliedEnd, setAppliedEnd] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'history', appliedStart, appliedEnd],
    queryFn: async () => {
      const result = await client.getReportsHistoryAction(appliedStart || undefined, appliedEnd || undefined);
      if (result.error) throw new Error(result.error);
      return result.reports;
    },
  });

  const handleApply = () => {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStart('');
    setAppliedEnd('');
  };

  const reports = data || [];

  const totalRealizado = reports.reduce((a: number, r: { realizado: number }) => a + (r.realizado || 0), 0);
  const totalMeta = reports.reduce((a: number, r: { meta: number }) => a + (r.meta || 0), 0);
  const diferenca = totalRealizado - totalMeta;

  const statusLabels: Record<string, string> = {
    otimo: 'Ótimo',
    atencao: 'Atenção',
    acima: 'Acima',
    critico: 'Crítico',
    sem_lancamento: 'Sem lançamento',
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Histórico</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Acompanhe todos os lançamentos por período</p>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6b7280] font-medium">De:</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6b7280] font-medium">Até:</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>
          <Button variant="primary" size="sm" onClick={handleApply}>Aplicar filtro</Button>
          <Button variant="secondary" size="sm" onClick={handleClear}>Limpar filtro</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            <KPICard label="Total Realizado" value={totalRealizado} type="neutral" />
            <KPICard label="Meta (Limite)" value={totalMeta} type="neutral" />
            <KPICard
              label="Diferença"
              value={diferenca}
              type={diferenca > 0 ? 'positive' : 'negative'}
            />
            <KPICard label="Registros" value={reports.length} type="neutral" formatAs="number" />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1f2937]">Detalhamento</h2>
          </div>
          {reports.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280]">
              Nenhum lançamento encontrado para o período selecionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Setor</th>
                    <th className="px-6 py-4">Realizado</th>
                    <th className="px-6 py-4">Meta (Limite)</th>
                    <th className="px-6 py-4">Diferença</th>
                    <th className="px-6 py-4">Percentual</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((r: { id: number; date: string; sectorName?: string; realizado: number; meta: number; diferenca: number; percentual: number; status: string; statusVariant: string }, idx: number) => {
                    const pos = r.diferenca >= 0;
                    return (
                      <tr key={r.id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-[#1f2937]">{formatDateBR(r.date)}</td>
                        <td className="px-6 py-4 font-semibold text-[#1f2937]">{r.sectorName || '-'}</td>
                        <td className="px-6 py-4 text-[#1f2937]">{formatCurrency(r.realizado)}</td>
                        <td className="px-6 py-4 text-[#6b7280]">{formatCurrency(r.meta)}</td>
                        <td className={`px-6 py-4 font-bold ${pos ? 'text-red-600' : 'text-[#16a34a]'}`}>
                          {pos ? '+' : ''}{formatCurrency(r.diferenca)}
                        </td>
                        <td className={`px-6 py-4 font-medium ${pos ? 'text-red-600' : 'text-[#16a34a]'}`}>
                          {r.percentual.toFixed(0)}%
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={r.statusVariant as 'success' | 'warning' | 'error' | 'info'} size="sm">
                            {statusLabels[r.status] || r.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
