'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { rolePermissions, type Role } from '@/lib/permissions';

interface SidebarProps {
  roles: string[];
  setores: number[];
}

const roleTitles: Record<string, string> = {
  admin: 'Gestor de Operações',
  gerente: 'Gerente Comercial',
  comprador: 'Comprador',
};

const ALL_ROLES: Role[] = ['admin', 'gerente', 'comprador'];

export default function Sidebar({ roles = [], setores = [] }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getPrimaryRole = () => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('gerente')) return 'gerente';
    return 'comprador';
  };

  const primaryRole = getPrimaryRole() as Role;

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

function DashboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
function ReportsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function SectorsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="8" y="2" rx="1"/><path d="M12 10v4"/><path d="M8 14H4v6h8v-6H8Z"/><path d="M20 14h-8v6h8v-6Z"/></svg>;
}
function EditIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
function BuildingIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
}