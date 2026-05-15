// Tipos centralizados para o projeto Prado-SaasTrocas

// ============================================
// TIPOS COMPARTILHADOS
// ============================================

export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

export type StatusTrocas = 'critico' | 'acima' | 'atencao' | 'otimo' | 'sem_lancamento';

export type Role = 'admin' | 'gerente' | 'comprador';

// ============================================
// USUÁRIOS
// ============================================

export interface UserBase {
  id: number;
  nome: string;
  role: string;
  setores: string;
  created_at: Date | null;
}

export interface UserWithRoles extends UserBase {
  roles: Role[];
  setoresIds: number[];
}

export interface UserPayload {
  sub: string;
  nome: string;
  roles: string[];
  setores: number[];
}

// ============================================
// SETORES
// ============================================

export interface SectorBase {
  id: number;
  nome: string;
  meta: number;
  comprador_id: number | null;
  created_at: Date | null;
}

export interface SectorWithComprador extends SectorBase {
  comprador?: {
    id: number;
    nome: string;
  };
}

// ============================================
// RELATÓRIOS
// ============================================

export interface DailyReport {
  id: number;
  date: string;
  valor_realizado: number;
  valor_meta: number;
  sector_id: number;
  created_at: Date | null;
}

export interface SectorReportData {
  sector_id: number;
  valor_realizado: number;
  valor_meta: number;
}

export interface ReportWithSector extends DailyReport {
  sector?: {
    id: number;
    nome: string;
  };
}

// ============================================
// SETORES COM DADOS DO DIA (Dashboard/Meus-setores)
// ============================================

export interface SectorWithData {
  id: number;
  nome: string;
  meta: number;
  realizado: number;
  diferenca: number;
  percentual: number;
  status: StatusTrocas;
  statusVariant: StatusVariant;
  hasReport: boolean;
}

// ============================================
// HELPERS PARA STATUS
// ============================================

export const statusLabels: Record<StatusTrocas, string> = {
  otimo: 'Ótimo',
  atencao: 'Atenção',
  acima: 'Acima',
  critico: 'Crítico',
  sem_lancamento: 'Sem lançamento',
};

export const statusColors: Record<StatusTrocas, string> = {
  otimo: 'bg-green-100 text-green-700 border-green-200',
  atencao: 'bg-[#ffff00] text-[#999900] border-[#ffcc00]/30',
  acima: 'bg-red-100 text-red-600 border-red-200',
  critico: 'bg-red-100 text-red-600 border-red-200',
  sem_lancamento: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function getStatusVariant(status: StatusTrocas): StatusVariant {
  switch (status) {
    case 'otimo': return 'success';
    case 'atencao': return 'warning';
    case 'acima':
    case 'critico': return 'error';
    case 'sem_lancamento': return 'info';
    default: return 'info';
  }
}

// ============================================
// PERMISSIONS
// ============================================

export const rolePermissions = {
  admin: ['/', '/relatorios', '/lancamentos', '/departamentos', '/usuarios', '/meus-setores', '/configuracoes'],
  gerente: ['/relatorios', '/meus-setores', '/configuracoes'],
  comprador: ['/meus-setores', '/configuracoes'],
} as const;

export function canAccess(role: Role, pathname: string): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  return permissions.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export function getVisibleRoutes(role: Role): string[] {
  return [...(rolePermissions[role] || [])];
}

export function getPrimaryRole(roles: string[]): Role {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('gerente')) return 'gerente';
  return 'comprador';
}

export const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  comprador: 'Comprador',
};