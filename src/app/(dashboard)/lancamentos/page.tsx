'use client';

import React, { useState, useCallback } from 'react';

const INITIAL_SECTORS = [
  { id: 1, nome: 'Açougue',   meta: 15000, realizado: 14250 },
  { id: 2, nome: 'Bebidas',   meta: 8000,  realizado: 4800  },
  { id: 3, nome: 'Petshop',   meta: 5000,  realizado: 5600  },
  { id: 4, nome: 'Higiene',   meta: 4000,  realizado: 3920  },
  { id: 5, nome: 'Mercearia', meta: 13000, realizado: 13930 },
];

type Sector = typeof INITIAL_SECTORS[number];
type SaveState = 'idle' | 'saving' | 'saved';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function LancamentosPage() {
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const [sectors, setSectors]       = useState<Sector[]>(INITIAL_SECTORS);
  const [saveStates, setSaveStates] = useState<Record<number, SaveState>>({});

  const autoSave = useCallback((id: number) => {
    setSaveStates(prev => ({ ...prev, [id]: 'saving' }));
    setTimeout(() => {
      setSaveStates(prev => ({ ...prev, [id]: 'saved' }));
      setTimeout(() => setSaveStates(prev => ({ ...prev, [id]: 'idle' })), 2000);
    }, 600);
  }, []);

  function handleChange(id: number, field: 'meta' | 'realizado', raw: string) {
    const value = parseFloat(raw.replace(',', '.')) || 0;
    setSectors(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    autoSave(id);
  }

  const totalMeta      = sectors.reduce((a, s) => a + s.meta, 0);
  const totalRealizado = sectors.reduce((a, s) => a + s.realizado, 0);
  const diferenca      = totalRealizado - totalMeta;
  const statusGeral    = totalMeta > 0 ? (totalRealizado / totalMeta) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Lançamentos do Dia</h1>
          <p className="text-sm text-[#6b7280] mt-0.5 capitalize">{today}</p>
        </div>
        <button
          onClick={() => setSectors(prev => prev.map(s => ({ ...s, realizado: 0 })))}
          className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 text-[#6b7280] rounded-lg transition-colors"
        >
          Zerar Realizados
        </button>
      </div>

      <div className="flex-1 p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Total Realizado</h3>
            <p className="text-3xl font-bold text-[#1f2937]">{fmt(totalRealizado)}</p>
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${statusGeral <= 100 ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                style={{ width: `${Math.min(statusGeral, 100)}%` }} />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Meta Total</h3>
            <p className="text-3xl font-bold text-[#6b7280]">{fmt(totalMeta)}</p>
          </div>
          <div className={`border rounded-xl p-5 relative overflow-hidden shadow-sm ${diferenca <= 0 ? 'bg-[#ffffe0] border-[#ffcc00]/30' : 'bg-red-50 border-red-200'}`}>
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Diferença</h3>
            <p className={`text-3xl font-bold ${diferenca <= 0 ? 'text-[#b39800]' : 'text-red-600'}`}>
              {diferenca > 0 ? '+' : ''}{fmt(diferenca)}
            </p>
            <div className={`absolute top-5 right-5 text-xs font-bold px-2 py-1 rounded ${diferenca <= 0 ? 'bg-[#ffff00] text-[#999900]' : 'bg-red-100 text-red-600'}`}>
              {statusGeral.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1f2937]">Editar Valores por Setor</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">Salvo automaticamente ao sair do campo.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <div className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse" />
              Salvamento automático
            </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Setor</th>
                <th className="px-6 py-4">Realizado (R$)</th>
                <th className="px-6 py-4">Meta (R$)</th>
                <th className="px-6 py-4 text-center">Diferença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sectors.map(s => {
                const dif   = s.realizado - s.meta;
                const pct   = s.meta > 0 ? (s.realizado / s.meta) * 100 : 0;
                const bom   = dif <= 0;
                const barW  = Math.min(Math.max(pct, 0), 100);
                const state = saveStates[s.id] ?? 'idle';
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 w-40">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1f2937]">{s.nome}</span>
                        {state === 'saving' && <svg className="animate-spin text-[#6b7280]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                        {state === 'saved'  && <svg className="text-[#16a34a]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <input type="number" step="0.01" defaultValue={s.realizado} onBlur={e => handleChange(s.id, 'realizado', e.target.value)}
                        className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors mb-1.5" />
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${bom ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-xs">R$</span>
                        <input type="number" step="0.01" defaultValue={s.meta} onBlur={e => handleChange(s.id, 'meta', e.target.value)}
                          className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#6b7280] rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none transition-colors" />
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-center font-bold text-sm ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                      {dif > 0 ? '+' : ''}{fmt(dif)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td className="px-6 py-4 text-xs font-bold text-[#6b7280] uppercase">Total</td>
                <td className="px-6 py-4 font-bold text-[#1f2937]">{fmt(totalRealizado)}</td>
                <td className="px-6 py-4 font-bold text-[#6b7280]">{fmt(totalMeta)}</td>
                <td className={`px-6 py-4 text-center font-bold ${diferenca <= 0 ? 'text-[#16a34a]' : 'text-red-600'}`}>
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
