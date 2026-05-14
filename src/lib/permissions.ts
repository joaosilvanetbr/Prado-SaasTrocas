export const rolePermissions = {
  admin: ['/', '/relatorios', '/lancamentos', '/departamentos', '/usuarios', '/meus-setores', '/configuracoes'],
  gerente: ['/relatorios', '/meus-setores', '/configuracoes'],
  comprador: ['/meus-setores', '/configuracoes'],
} as const;

export type Role = keyof typeof rolePermissions;

export function canAccess(role: Role, pathname: string): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  return permissions.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export function getVisibleRoutes(role: Role): string[] {
  return [...(rolePermissions[role] || [])];
}

export function hasRole(roles: string[], role: Role): boolean {
  return roles.includes(role);
}

export function hasAnyRole(roles: string[], allowedRoles: Role[]): boolean {
  return roles.some(r => allowedRoles.includes(r as Role));
}

export function getPrimaryRole(roles: string[]): Role {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('gerente')) return 'gerente';
  return 'comprador';
}