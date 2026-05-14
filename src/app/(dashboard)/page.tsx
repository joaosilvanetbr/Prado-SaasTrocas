import KPICards from "@/components/KPICards";
import SectorsTable, { SectorData } from "@/components/SectorsTable";
import { cookies } from "next/headers";

const MOCK_SECTORS: SectorData[] = [
  { id: 1, nome: "Açougue",   meta: 15000, realizado: 14250 },
  { id: 2, nome: "Bebidas",   meta: 8000,  realizado: 4800  },
  { id: 3, nome: "Petshop",   meta: 5000,  realizado: 5600  },
  { id: 4, nome: "Higiene",   meta: 4000,  realizado: 3920  },
  { id: 5, nome: "Mercearia", meta: 13000, realizado: 13930 },
];

function formatDateBR(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value || 'admin';

  const today = formatDateBR(new Date());
  const visibleSectors = MOCK_SECTORS;
  const totalMeta      = visibleSectors.reduce((a, s) => a + s.meta, 0);
  const totalRealizado = visibleSectors.reduce((a, s) => a + s.realizado, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Topbar */}
      <div className="h-24 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight uppercase">
            Relatório de Trocas Diário
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5 capitalize">{today}</p>
        </div>
        {/* Indicador visual da data atual */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#f9fafb] border border-gray-200 rounded-xl px-5 py-3">
            <svg width="18" height="18" className="text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span className="text-base font-semibold text-[#1f2937]">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          {/* Indicador live */}
          <div className="flex items-center gap-2 bg-[#ffff00]/50 border border-[#ffcc00]/30 rounded-xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse" />
            <span className="text-xs font-semibold text-[#b45309] uppercase tracking-wide">Ao vivo</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-6">
        <KPICards meta={totalMeta} realizado={totalRealizado} />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1f2937]">Detalhamento por Setor</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">Visão consolidada do dia atual.</p>
            </div>
            <span className="text-xs text-[#6b7280] bg-gray-100 px-3 py-1 rounded-full">
              {visibleSectors.length} setores
            </span>
          </div>
          <SectorsTable sectors={visibleSectors} />
        </div>
      </div>
    </div>
  );
}
