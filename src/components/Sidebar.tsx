'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { type Role } from '@/lib/permissions';
import { DashboardIcon, ReportsIcon, UsersIcon, SectorsIcon, EditIcon, BuildingIcon, SettingsIcon, LogoutIcon } from '@/components/icons';

interface SidebarProps {
  roles: string[];
}

const roleTitles: Record<string, string> = {
  admin: 'Gestor de Operações',
  gerente: 'Gerente Comercial',
  comprador: 'Comprador',
};

export default function Sidebar({ roles = [] }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const hasRole = (role: Role) => roles.includes(role);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  const displayRole = roles.length > 1
    ? roles.map(r => r.charAt(0).toUpperCase()).join(' / ')
    : (roles[0] || 'admin');

  return (
    <aside className="w-64 bg-[#1e40af] border-r border-[#1e3a8a] text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight uppercase leading-tight">
          RELATÓRIO DE <br/> TROCAS
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {[
          { href: '/', label: 'Dashboard', icon: <DashboardIcon />, roles: ['admin'] as Role[] },
          { href: '/meus-setores', label: 'Meus Setores', icon: <SectorsIcon />, roles: ['admin', 'gerente', 'comprador'] as Role[] },
          { href: '/relatorios', label: 'Relatórios', icon: <ReportsIcon />, roles: ['admin', 'gerente'] as Role[] },
          { href: '/lancamentos', label: 'Lançamentos', icon: <EditIcon />, roles: ['admin'] as Role[] },
          { href: '/departamentos', label: 'Departamentos', icon: <BuildingIcon />, roles: ['admin'] as Role[] },
          { href: '/usuarios', label: 'Usuários', icon: <UsersIcon />, roles: ['admin'] as Role[] },
        ]
          .filter(item => item.roles.some(r => hasRole(r)))
          .map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group ${
                pathname === item.href
                  ? 'bg-[#ffff00] text-[#1f2937] font-medium shadow-sm'
                  : 'hover:bg-[#1e3a8a] text-white/90 hover:translate-x-0.5'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="p-4 space-y-2 border-t border-[#1e3a8a]">
        <Link
          href="/configuracoes"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 hover:translate-x-0.5 ${
            pathname === '/configuracoes'
              ? 'bg-[#ffff00] text-[#1f2937] font-medium shadow-sm'
              : 'hover:bg-[#1e3a8a] text-white/90'
          }`}
        >
          <SettingsIcon /> Configurações
        </Link>
        <button
          onClick={handleLogout}
          className="w-full bg-[#dc2626]/10 hover:bg-[#dc2626]/20 text-[#dc2626] font-semibold py-2.5 rounded-md mt-3 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 text-sm border border-[#dc2626]/20"
        >
          <LogoutIcon /> Sair
        </button>

        <div className="mt-5 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[#ffff00] overflow-hidden flex-shrink-0 flex items-center justify-center">
            <span className="text-[#1e40af] font-bold text-sm">{displayRole}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{displayRole}</p>
            <p className="text-xs text-white/60 truncate capitalize">
              {roles.map(r => roleTitles[r] || r).join(' / ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}