'use client';

import React, { useState } from 'react';

const MY_SECTORS_TODAY = [
  { id: 1, nome: 'Açougue',   meta: 15000, realizado: 14250 },
  { id: 2, nome: 'Bebidas',   meta: 8000,  realizado: 8200  },
  { id: 3, nome: 'Petshop',   meta: 5000,  realizado: 5100  },
  { id: 4, nome: 'Higiene',   meta: 4000,  realizado: 3920  },
  { id: 5, nome: 'Mercearia', meta: 13000, realizado: 12800 },
  { id: 6, nome: 'Padaria',   meta: 7000,  realizado: 6500  },
  { id: 7, nome: 'Hortifruti',meta: 6000,  realizado: 5800  },
];

const HISTORY: Record<string, typeof MY_SECTORS_TODAY> = {
  '2026-05-13': MY_SECTORS_TODAY,
  '2026-05-12': [
    { id: 1, nome: 'Açougue',   meta: 15000, realizado: 16200 },
    { id: 2, nome: 'Bebidas',   meta: 8000,  realizado: 7900  },
    { id: 3, nome: 'Petshop',   meta: 5000,  realizado: 4800  },
    { id: 4, nome: 'Higiene',   meta: 4000,  realizado: 4150  },
    { id: 5, nome: 'Mercearia', meta: 13000, realizado: 13500 },
    { id: 6, nome: 'Padaria',   meta: 7000,  realizado: 6800  },
    { id: 7, nome: 'Hortifruti',meta: 6000,  realizado: 5900  },
  ],
  '2026-05-09': [
    { id: 1, nome: 'Açougue',   meta: 15000, realizado: 11000 },
    { id: 2, nome: 'Bebidas',   meta: 8000,  realizado: 7500  },
    { id: 3, nome: 'Petshop',   meta: 5000,  realizado: 4200  },
    { id: 4, nome: 'Higiene',   meta: 4000,  realizado: 2900  },
    { id: 5, nome: 'Mercearia', meta: 13000, realizado: 12000 },
    { id: 6, nome: 'Padaria',   meta: 7000,  realizado: 6000  },
    { id: 7, nome: 'Hortifruti',meta: 6000,  realizado: 5100  },
  ],
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function getUserSetoresFromCookie(): number[] {
  if (typeof document === 'undefined') return [];
  const match = document.cookie.match(/auth_token=([^;]+)/);
  if (!match) return [];
  try {
    const payload = JSON.parse(atob(match[1].split('.')[1]));
    return payload.setores || [];
  } catch {
    return [];
  }
}

function getUserRolesFromCookie(): string[] {
  if (typeof document === 'undefined') return [];
  const match = document.cookie.match(/auth_token=([^;]+)/);
  if (!match) return [];
  try {
    const payload = JSON.parse(atob(match[1].split('.')[1]));
    return payload.roles || [];
  } catch {
    return [];
  }
}

const formatDateLabel = (iso: string) => {
  const [y, m, day] = iso.split('-');
  return `${day}/${m}/${y}`;
};

export default function MeusSetoresPage() {
  const [selectedDate, setSelectedDate] = useState('2026-05-13');

  const userSetores: number[] = typeof window !== 'undefined' ? getUserSetoresFromCookie() : [];
  const userRoles: string[] = typeof window !== 'undefined' ? getUserRolesFromCookie() : [];
  const isAdmin = userRoles.includes('admin');

  const allDates = Object.keys(HISTORY).sort((a, b) => b.localeCompare(a));

  const getSectors = (dateKey: string) => {
    const sectors = HISTORY[dateKey] ?? [];
    if (isAdmin || userSetores.length === 0) return sectors;
    return sectors.filter(s => userSetores.includes(s.id));
  };

  const sectors = getSectors(selectedDate);
  const totalMeta      = sectors.reduce((a, s) => a + s.meta, 0);
  const totalRealizado = sectors.reduce((a, s) => a + s.realizado, 0);
  const diferenca      = totalRealizado - totalMeta;
  const pctGeral       = totalMeta > 0 ? (totalRealizado / totalMeta) * 100 : 0;
  const isToday        = selectedDate === allDates[0];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Meus Setores</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {isAdmin ? 'Visão de todos os setores.' : sectors.length > 0 ? `${sectors.length} setor${sectors.length > 1 ? 'es' : ''} atribuído${sectors.length > 1 ? 's' : ''}.` : 'Nenhum setor atribuído.'}
          </p>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-0 animate-fade-in stagger-1">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Meu Realizado</h3>
            <p className="text-3xl font-bold text-[#1f2937]">{fmt(totalRealizado)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-0 animate-fade-in stagger-2">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Minha Meta</h3>
            <p className="text-3xl font-bold text-[#6b7280]">{fmt(totalMeta)}</p>
          </div>
          <div className={`border rounded-xl p-5 relative overflow-hidden shadow-sm opacity-0 animate-fade-in stagger-3 ${
            diferenca >= 0 ? 'bg-[#ffffe0] border-[#ffcc00]/30' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Diferença</h3>
            <p className={`text-3xl font-bold ${diferenca >= 0 ? 'text-[#b39800]' : 'text-red-600'}`}>
              {diferenca >= 0 ? '+' : ''}{fmt(diferenca)}
            </p>
            <div className={`absolute top-5 right-5 text-xs font-bold px-2 py-1 rounded ${
              diferenca >= 0 ? 'bg-[#ffff00] text-[#999900]' : 'bg-red-100 text-red-600'
            }`}>
              {pctGeral.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1f2937]">Desempenho</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                {isToday ? 'Visão do dia atual.' : `Histórico — ${formatDateLabel(selectedDate)}`}
              </p>
            </div>
            {isToday && (
              <div className="flex items-center gap-2 text-xs text-[#b39800] bg-[#ffff00]/50 border border-[#ffcc00]/30 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] animate-pulse" />
                Ao vivo
              </div>
            )}
          </div>

          {sectors.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40"><rect width="8" height="8" x="8" y="2" rx="1"/><path d="M12 10v4"/><path d="M8 14H4v6h8v-6H8Z"/><path d="M20 14h-8v6h8v-6Z"/></svg>
              <p className="text-sm">Nenhum setor atribuído a este usuário.</p>
            </div>
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
                  const dif  = s.realizado - s.meta;
                  const pct  = s.meta > 0 ? (s.realizado / s.meta) * 100 : 0;
                  const pos  = dif >= 0;
                  const barW = Math.min(pct, 100);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${0.2 + idx * 0.06}s`, animationFillMode: 'forwards' }}>
                      <td className="px-6 py-4 font-semibold text-[#1f2937]">{s.nome}</td>
                      <td className="px-6 py-4 min-w-[180px]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[#1f2937] font-medium">{fmt(s.realizado)}</span>
                          <span className={`text-xs font-bold ml-4 ${pos ? 'text-[#16a34a]' : 'text-red-600'}`}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pos ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                            style={{ width: `${barW}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6b7280]">{fmt(s.meta)}</td>
                      <td className={`px-6 py-4 font-bold ${pos ? 'text-[#16a34a]' : 'text-red-600'}`}>{pos ? '+' : ''}{fmt(dif)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <h3 className="text-sm font-semibold text-[#1f2937] mb-4">Histórico</h3>
          <div className="grid grid-cols-3 gap-3">
            {allDates.map(d => {
              const s    = getSectors(d);
              const real = s.reduce((a, x) => a + x.realizado, 0);
              const met  = s.reduce((a, x) => a + x.meta, 0);
              const p    = met > 0 ? (real / met) * 100 : 0;
              const [y, m, day] = d.split('-');
              const active = d === selectedDate;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`text-left p-4 rounded-lg border transition-all hover:scale-[1.02] active:scale-95 ${
                    active ? 'border-[#1e40af] bg-[#1e40af]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs text-[#9ca3af] mb-1">{day}/{m}/{y}</p>
                  <p className="font-semibold text-[#1f2937] text-sm">{fmt(real)}</p>
                  <p className={`text-xs font-bold mt-1 ${p >= 100 ? 'text-[#16a34a]' : p >= 85 ? 'text-[#6b7280]' : 'text-red-600'}`}>{p.toFixed(1)}%</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}