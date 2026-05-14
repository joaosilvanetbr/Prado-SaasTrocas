export const rolePermissions = {
  admin: ['/', '/relatorios', '/lancamentos', '/departamentos', '/usuarios', '/meus-setores', '/configuracoes'],
  gerente: ['/relatorios', '/meus-setores', '/configuracoes'],
  comprador: ['/meus-setores', '/configuracoes'],
} as const;

export type Role = keyof typeof rolePermissions;

export function canAccess(role: Role, pathname: string): boolean {
  const permissions = rolePermissions[role];
  return permissions.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export function getVisibleRoutes(role: Role): string[] {
  return [...(rolePermissions[role] || [])];
}