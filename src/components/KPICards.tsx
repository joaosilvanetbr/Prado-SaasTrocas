import React from 'react';

interface KPICardsProps {
  realizado: number;
  meta: number;
}

export default function KPICards({ realizado, meta }: KPICardsProps) {
  const diferenca = realizado - meta;

  const abaixoDaMeta = diferenca <= 0;
  const diferencaPercent = meta > 0 ? (diferenca / meta) * 100 : 0;

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Total Realizado */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-0 animate-fade-in stagger-1">
        <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-3">Total Realizado</h3>
        <p className="text-3xl font-bold text-[#1f2937] tracking-tight">
          {fmt(realizado)}
        </p>
      </div>

      {/* Meta Total */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-0 animate-fade-in stagger-2">
        <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-3">Meta (Limite)</h3>
        <p className="text-3xl font-bold text-[#6b7280] tracking-tight">
          {fmt(meta)}
        </p>
      </div>

      {/* Diferença — amarelo claro se bom, vermelho se acima */}
      <div className={`border rounded-xl p-5 relative overflow-hidden shadow-sm opacity-0 animate-fade-in stagger-3 ${
        abaixoDaMeta
          ? 'bg-[#ffffe0] border-[#ffcc00]/30'
          : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-3">Diferença</h3>
        <p className={`text-3xl font-bold tracking-tight ${abaixoDaMeta ? 'text-[#b39800]' : 'text-red-600'}`}>
          {diferenca > 0 ? '+' : ''}{fmt(diferenca)}
        </p>
        <div className={`absolute top-5 right-5 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
          abaixoDaMeta ? 'bg-[#ffff00] text-[#999900]' : 'bg-red-100 text-red-600'
        }`}>
          {abaixoDaMeta
            ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
          }
          {Math.abs(diferencaPercent).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
