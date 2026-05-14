import React from 'react';

export interface SectorData {
  id: number;
  nome: string;
  meta: number;
  realizado: number;
}

interface SectorsTableProps {
  sectors: SectorData[];
}

function StatusBadge({ pct, isBest, isWorst }: { pct: number; isBest: boolean; isWorst: boolean }) {
  if (isWorst)  return <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full border border-red-200 uppercase tracking-wide">Crítico</span>;
  if (isBest)   return <span className="px-3 py-1 bg-[#ffff00] text-[#999900] text-xs font-bold rounded-full border border-[#ffcc00]/30 uppercase tracking-wide">Melhor</span>;
  if (pct < 85) return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">Ótimo</span>;
  if (pct < 100)return <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full border border-blue-200">Estável</span>;
  return          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full border border-red-200">Acima</span>;
}

export default function SectorsTable({ sectors }: SectorsTableProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

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
    <div className="w-full">
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
            const bom       = diferenca <= 0;
            const barWidth  = Math.min(Math.max(pct, 0), 100);

            return (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: 'forwards' }}>
                <td className="px-5 py-5 font-medium text-[#1f2937]">{s.nome}</td>

                <td className="px-5 py-4 min-w-[220px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#1f2937] font-medium">{fmt(s.realizado)}</span>
                    <span className={`text-xs font-bold ml-4 ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bom ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </td>

                <td className="px-5 py-5 text-[#6b7280]">{fmt(s.meta)}</td>

                <td className={`px-5 py-5 font-bold ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                  {diferenca > 0 ? '+' : ''}{fmt(diferenca)}
                </td>

                <td className="px-5 py-5 text-center">
                  <StatusBadge
                    pct={pct}
                    isBest={s.id === bestId && sectors.length > 1}
                    isWorst={s.id === worstId && sectors.length > 1 && maxPct > 100}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
