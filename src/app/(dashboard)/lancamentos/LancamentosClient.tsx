'use client';

import React, { useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/format';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import KPIGroup from '@/components/ui/KPICard';
import { useReports } from '@/hooks/useReports';
import { getStatusTrocas, type StatusTrocas } from '@/lib/performance';

type Sector = {
  id: number;
  nome: string;
  meta: number;
  realizado: number;
};
type SaveState = 'idle' | 'saving' | 'saved';

interface LancamentosClientProps {
  initialSectors: Sector[];
  date: string;
}

export default function LancamentosClient({ initialSectors, date }: LancamentosClientProps) {
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [saveStates, setSaveStates] = useState<Record<number, SaveState>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const { saveDailyReport, isSaving } = useReports();

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const autoSave = useCallback((sector: Sector) => {
    setSaveStates(prev => ({ ...prev, [sector.id]: 'saving' }));
    saveDailyReport({
      date,
      sectors: [{
        sector_id: sector.id,
        valor_realizado: sector.realizado,
        valor_meta: sector.meta,
      }],
    }, {
      onSuccess: () => {
        setSaveStates(prev => ({ ...prev, [sector.id]: 'saved' }));
        setTimeout(() => { setSaveStates(prev => ({ ...prev, [sector.id]: 'idle' })); }, 2000);
      },
      onError: () => {
        setSaveStates(prev => ({ ...prev, [sector.id]: 'idle' }));
      },
    });
  }, [date, saveDailyReport]);

  function handleChange(id: number, field: 'realizado', raw: string) {
    const value = parseFloat(raw.replace(',', '.')) || 0;
    setSectors(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      return updated;
    }));
  }

  function handleBlur(id: number, raw: string) {
    const sector = sectors.find(s => s.id === id);
    if (sector) {
      const updated = { ...sector, realizado: parseFloat(raw.replace(',', '.')) || 0 };
      autoSave(updated);
    }
  }

  const handleZerarRealizados = () => {
    const zeros = sectors.map(s => ({
      sector_id: s.id,
      valor_realizado: 0,
      valor_meta: s.meta,
    }));
    saveDailyReport({ date, sectors: zeros }, {
      onSuccess: () => {
        setSectors(prev => prev.map(s => ({ ...s, realizado: 0 })));
        setShowConfirm(false);
      },
    });
  };

  const totalMeta      = sectors.reduce((a, s) => a + s.meta, 0);
  const totalRealizado = sectors.reduce((a, s) => a + s.realizado, 0);
  const diferenca      = totalRealizado - totalMeta;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">Lançamentos do Dia</h1>
          <p className="text-sm text-[#6b7280] mt-0.5 capitalize">{today}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowConfirm(true)}
        >
          Zerar Realizados
        </Button>
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Zerar Realizados"
        description="Tem certeza que deseja definir todos os realizados como zero?"
      >
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleZerarRealizados}>Zerar</Button>
        </div>
      </Modal>

      <div className="flex-1 p-8 space-y-6">
        <KPIGroup realizado={totalRealizado} meta={totalMeta} />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1f2937]">Editar Valores por Setor</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">Salvo automaticamente ao sair do campo.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <div className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse" />
              {isSaving ? 'Salvando...' : 'Salvamento automático'}
            </div>
          </div>
          <div className="overflow-x-auto">
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
                          {state === 'saving' && (
                            <svg className="animate-spin text-[#6b7280]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          )}
                          {state === 'saved' && (
                            <svg className="text-[#16a34a]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <input type="number" step="0.01" defaultValue={s.realizado} onBlur={e => handleBlur(s.id, e.target.value)}
                          className="w-full bg-white border border-gray-300 hover:border-[#1e40af] focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/20 text-[#1f2937] rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors mb-1.5" />
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${bom ? 'bg-[#ffcc00]' : 'bg-red-500'}`}
                            style={{ width: `${barW}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#1e40af] font-semibold">
                        {formatCurrency(s.meta)}
                      </td>
                      <td className={`px-6 py-4 text-center font-bold text-sm ${bom ? 'text-[#16a34a]' : 'text-red-600'}`}>
                        {dif > 0 ? '+' : ''}{formatCurrency(dif)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td className="px-6 py-4 text-xs font-bold text-[#6b7280] uppercase">Total</td>
                  <td className="px-6 py-4 font-bold text-[#1f2937]">{formatCurrency(totalRealizado)}</td>
                  <td className="px-6 py-4 font-bold text-[#6b7280]">{formatCurrency(totalMeta)}</td>
                  <td className={`px-6 py-4 text-center font-bold ${diferenca <= 0 ? 'text-[#16a34a]' : 'text-red-600'}`}>
                    {diferenca > 0 ? '+' : ''}{formatCurrency(diferenca)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
