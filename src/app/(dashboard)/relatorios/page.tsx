'use client';

import React, { useState } from 'react';

const MOCK_SECTORS = [
  { id: 1, nome: 'Açougue',   meta: 15000, realizado: 14250 },
  { id: 2, nome: 'Bebidas',   meta: 8000,  realizado: 4800  },
  { id: 3, nome: 'Petshop',   meta: 5000,  realizado: 5600  },
  { id: 4, nome: 'Higiene',   meta: 4000,  realizado: 3920  },
  { id: 5, nome: 'Mercearia', meta: 13000, realizado: 13930 },
];

const MOCK_HISTORY: Record<string, typeof MOCK_SECTORS> = {
  '2026-05-13': MOCK_SECTORS,
  '2026-05-12': [
    { id: 1, nome: 'Açougue',   meta: 15000, realizado: 16200 },
    { id: 2, nome: 'Bebidas',   meta: 8000,  realizado: 8400  },
    { id: 3, nome: 'Petshop',   meta: 5000,  realizado: 4900  },
    { id: 4, nome: 'Higiene',   meta: 4000,  realizado: 4200  },
    { id: 5, nome: 'Mercearia', meta: 13000, realizado: 14100 },
  ],
  '2026-05-09': [
    { id: 1, nome: 'Açougue',   meta: 15000, realizado: 11000 },
    { id: 2, nome: 'Bebidas',   meta: 8000,  realizado: 5600  },
    { id: 3, nome: 'Petshop',   meta: 5000,  realizado: 3200  },
    { id: 4, nome: 'Higiene',   meta: 4000,  realizado: 2900  },
    { id: 5, nome: 'Mercearia', meta: 13000, realizado: 10700 },
  ],
};

function StatusBadge({ pct }: { pct: number }) {
  if (pct >= 110) return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Ótimo</span>;
  if (pct >= 100) return <span className="px-2.5 py-1 bg-[#ffff00] text-[#999900] text-xs font-bold rounded-full border border-[#ffcc00]/30">Positivo</span>;
  if (pct >= 85)  return <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full border border-blue-200">Estável</span>;
  return <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full border border-red-200">Crítico</span>;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function HistoricoPage() {
  const availableDates = Object.keys(MOCK_HISTORY).sort((a, b) => b.localeCompare(a));
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);

  const sectors   = MOCK_HISTORY[selectedDate] ?? [];
  const totalMeta      = sectors.reduce((a, s) => a + s.meta, 0);
  const totalRealizado = sectors.reduce((a, s) => a + s.realizado, 0);
  const diferenca      = totalRealizado - totalMeta;
  const statusGeral    = totalMeta > 0 ? (totalRealizado / totalMeta) * 100 : 0;

  const formatDateLabel = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Topbar */}
      <div className="h-24 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Histórico</h1>
          <p className="text-sm text-[#6b7280] mt-0.5 capitalize">{formatDateLabel(selectedDate)}</p>
        </div>
        {/* Seletor de Data */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <svg width="16" height="16" className="text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent text-[#1f2937] text-sm font-medium focus:outline-none cursor-pointer"
          >
            {availableDates.map(d => {
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
        {/* KPI Cards do dia selecionado */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Total Realizado</h3>
            <p className="text-3xl font-bold text-[#1f2937]">{fmt(totalRealizado)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Meta Total</h3>
            <p className="text-3xl font-bold text-[#6b7280]">{fmt(totalMeta)}</p>
          </div>
          <div className={`border rounded-xl p-5 relative overflow-hidden shadow-sm ${
            diferenca <= 0 ? 'bg-[#ffffe0] border-[#ffcc00]/30' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Diferença</h3>
            <p className={`text-3xl font-bold ${diferenca <= 0 ? 'text-[#b39800]' : 'text-red-600'}`}>
              {diferenca > 0 ? '+' : ''}{fmt(diferenca)}
            </p>
            <div className={`absolute top-5 right-5 text-xs font-bold px-2 py-1 rounded ${
              diferenca <= 0 ? 'bg-[#ffff00] text-[#999900]' : 'bg-red-100 text-red-600'
            }`}>
              {statusGeral.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Tabela por Setor */}
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
                        <span className="text-[#1f2937] font-medium">{fmt(s.realizado)}</span>
                        <span className={`text-xs font-bold ml-4 ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${bom ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6b7280]">{fmt(s.meta)}</td>
                    <td className={`px-6 py-4 font-bold ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                      {dif > 0 ? '+' : ''}{fmt(dif)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td className="px-6 py-4 text-xs font-bold text-[#6b7280] uppercase tracking-wide">Total</td>
                <td className="px-6 py-4 font-bold text-[#1f2937]">{fmt(totalRealizado)}</td>
                <td className="px-6 py-4 font-bold text-[#6b7280]">{fmt(totalMeta)}</td>
                <td className={`px-6 py-4 font-bold ${diferenca <= 0 ? 'text-[#16a34a]' : 'text-red-600'}`}>
                  {diferenca > 0 ? '+' : ''}{fmt(diferenca)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
