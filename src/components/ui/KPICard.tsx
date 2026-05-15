import React from 'react';
import Card from './Card';
import Badge from './Badge';
import { formatCurrency } from '@/lib/format';

interface KPICardProps {
  label: string;
  value: number;
  type?: 'neutral' | 'positive' | 'negative';
  suffix?: string;
  icon?: React.ReactNode;
}

export function KPICard({ label, value, type = 'neutral', suffix, icon }: KPICardProps) {
  const valueColor = type === 'positive' ? 'text-red-600' : type === 'negative' ? 'text-[#16a34a]' : 'text-[#1f2937]';

  return (
    <Card variant="default" className="opacity-0 animate-fade-in">
      <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">{label}</h3>
      <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
        {formatCurrency(value)}
        {suffix && <span className="text-sm ml-1">{suffix}</span>}
      </p>
      {icon && <div className="absolute top-5 right-5">{icon}</div>}
    </Card>
  );
}

interface KPIGroupProps {
  realizado: number;
  meta: number;
}

export default function KPIGroup({ realizado, meta }: KPIGroupProps) {
  const diferenca = realizado - meta;
  const abaixoDaMeta = diferenca <= 0;
  const diferencaPercent = meta > 0 ? (diferenca / meta) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <KPICard label="Total Realizado" value={realizado} type="neutral" />
      <KPICard label="Meta (Limite)" value={meta} type="neutral" />
      <Card
        variant="default"
        className={`relative overflow-hidden ${abaixoDaMeta ? 'bg-[#ffffe0] border-[#ffcc00]/30' : 'bg-red-50 border-red-200'}`}
      >
        <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">Diferença</h3>
        <p className={`text-3xl font-bold tracking-tight ${abaixoDaMeta ? 'text-[#16a34a]' : 'text-red-600'}`}>
          {diferenca > 0 ? '+' : ''}{formatCurrency(diferenca)}
        </p>
        <div className={`absolute top-5 right-5 text-xs font-bold px-2 py-1 rounded ${
          abaixoDaMeta ? 'bg-[#ffff00] text-[#999900]' : 'bg-red-100 text-red-600'
        }`}>
          <Badge variant={abaixoDaMeta ? 'warning' : 'error'} size="sm">
            {Math.abs(diferencaPercent).toFixed(1)}%
          </Badge>
        </div>
      </Card>
    </div>
  );
}