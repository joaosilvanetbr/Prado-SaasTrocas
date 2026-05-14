import React from 'react';
import Badge from './Badge';
import { formatCurrency } from '@/lib/format';

export interface SectorRowData {
  id: number;
  nome: string;
  meta: number;
  realizado: number;
}

interface SectorRowProps {
  sector: SectorRowData;
  animationDelay?: number;
  showStatus?: boolean;
  bestId?: number;
  worstId?: number;
}

export default function SectorRow({ sector, animationDelay = 0, showStatus = false, bestId, worstId }: SectorRowProps) {
  const diferenca = sector.realizado - sector.meta;
  const pct = sector.meta > 0 ? (sector.realizado / sector.meta) * 100 : 0;
  const pos = diferenca <= 0;
  const barWidth = Math.min(Math.max(pct, 0), 100);

  const getStatusBadge = () => {
    if (showStatus && sector.id === worstId && pct > 100) {
      return <Badge variant="error" size="sm">Crítico</Badge>;
    }
    if (showStatus && sector.id === bestId) {
      return <Badge variant="warning" size="sm">Melhor</Badge>;
    }
    if (pct < 85) return <Badge variant="success" size="sm">Ótimo</Badge>;
    if (pct < 100) return <Badge variant="info" size="sm">Estável</Badge>;
    return <Badge variant="error" size="sm">Acima</Badge>;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${animationDelay}s`, animationFillMode: 'forwards' }}>
      <td className="px-5 py-5 font-medium text-[#1f2937]">{sector.nome}</td>
      <td className="px-5 py-4 min-w-[220px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[#1f2937] font-medium">{formatCurrency(sector.realizado)}</span>
          <span className={`text-xs font-bold ml-4 ${pos ? 'text-[#16a34a]' : 'text-red-600'}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pos ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </td>
      <td className="px-5 py-5 text-[#6b7280]">{formatCurrency(sector.meta)}</td>
      <td className={`px-5 py-5 font-bold ${pos ? 'text-[#16a34a]' : 'text-red-600'}`}>
        {diferenca > 0 ? '+' : ''}{formatCurrency(diferenca)}
      </td>
      {showStatus && (
        <td className="px-5 py-5 text-center">
          {getStatusBadge()}
        </td>
      )}
    </tr>
  );
}