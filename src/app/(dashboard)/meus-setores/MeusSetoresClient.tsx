'use client';

import React from 'react';
import { formatCurrency } from '@/lib/format';
import { KPICard } from '@/components/ui/KPICard';
import Badge from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import * as meusSetoresActions from '@/app/actions/meus-setores.actions';

type SectorData = {
  id: number;
  nome: string;
  meta: number;
  realizado: number;
  diferenca: number;
  percentual: number;
  status: string;
  statusVariant: string;
  hasReport: boolean;
};

interface MeusSetoresClientProps {
  userSetores: number[];
  isAdmin: boolean;
  totalSetores: number;
}

const statusLabels: Record<string, string> = {
  otimo: 'Ótimo',
  atencao: 'Atenção',
  acima: 'Acima',
  critico: 'Crítico',
  sem_lancamento: 'Sem lançamento',
};

const statusColors: Record<string, string> = {
  otimo: 'bg-green-100 text-green-700 border-green-200',
  atencao: 'bg-[#ffff00] text-[#999900] border-[#ffcc00]/30',
  acima: 'bg-red-100 text-red-600 border-red-200',
  critico: 'bg-red-100 text-red-600 border-red-200',
  sem_lancamento: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function MeusSetoresClient({ userSetores, isAdmin, totalSetores }: MeusSetoresClientProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['meus-setores'],
    queryFn: async () => {
      const result = await meusSetoresActions.getMySectorsData();
      if (result.error) throw new Error(result.error);
      return result.sectors;
    },
  });

  const sectors: SectorData[] = data || [];
  const totalRealizado = sectors.reduce((a, s) => a + s.realizado, 0);
  const totalMeta = sectors.reduce((a, s) => a + s.meta, 0);
  const diferenca = totalRealizado - totalMeta;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Meus Setores</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {isAdmin ? `Visão de todos os ${totalSetores} setores.` : userSetores.length > 0 ? `${userSetores.length} setor${userSetores.length > 1 ? 'es' : ''} atribuído${userSetores.length > 1 ? 's' : ''}.` : 'Nenhum setor atribuído.'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            <KPICard label="Setores Vinculados" value={sectors.length} type="neutral" formatAs="number" />
            <KPICard label="Total Realizado" value={totalRealizado} type="neutral" />
            <KPICard label="Meta (Limite)" value={totalMeta} type="neutral" />
            <KPICard
              label="Diferença"
              value={diferenca}
              type={diferenca > 0 ? 'positive' : 'negative'}
            />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1f2937]">Desempenho</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">Acompanhe os setores vinculados ao seu usuário</p>
            </div>
            <Badge variant="warning" size="sm">Ao vivo</Badge>
          </div>

          {sectors.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280]">
              Nenhum setor atribuído a este usuário.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Setor</th>
                    <th className="px-6 py-4">Realizado</th>
                    <th className="px-6 py-4">Meta (Limite)</th>
                    <th className="px-6 py-4">Diferença</th>
                    <th className="px-6 py-4">Percentual</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sectors.map((s, idx) => {
                    const pos = s.diferenca >= 0;
                    const barW = Math.min(s.percentual, 100);
                    const barColor = s.hasReport ? (pos ? 'bg-red-500' : 'bg-[#ffcc00]') : 'bg-gray-300';
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#1f2937]">{s.nome}</td>
                        <td className="px-6 py-4 min-w-[180px]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[#1f2937] font-medium">{formatCurrency(s.realizado)}</span>
                            <span className={`text-xs font-bold ml-4 ${pos ? 'text-red-600' : 'text-[#16a34a]'}`}>{s.percentual.toFixed(0)}%</span>
                          </div>
                          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${barW}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#6b7280]">{formatCurrency(s.meta)}</td>
                        <td className={`px-6 py-4 font-bold ${pos ? 'text-red-600' : 'text-[#16a34a]'}`}>
                          {pos ? '+' : ''}{formatCurrency(s.diferenca)}
                        </td>
                        <td className={`px-6 py-4 ${pos ? 'text-red-600' : 'text-[#16a34a]'}`}>
                          {s.percentual.toFixed(0)}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center font-semibold rounded-full border text-xs px-2.5 py-0.5 ${statusColors[s.status] || statusColors.sem_lancamento}`}>
                            {statusLabels[s.status] || 'Sem lançamento'}
                          </span>
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
