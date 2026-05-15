import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';
import { rolePermissions, getPrimaryRole, hasAnyRole, type Role } from '@/lib/permissions';

interface UserPayload {
  sub: string;
  nome: string;
  roles?: string[];
  setores?: number[];
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login');

  let payload: UserPayload | null = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, getJwtSecret());
      payload = verified.payload as unknown as UserPayload;
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    if (!isLoginPage) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isLoginPage) {
    const primaryRole = getPrimaryRole(payload.roles || []);
    const home = primaryRole === 'admin' ? '/' : primaryRole === 'gerente' ? '/relatorios' : '/meus-setores';
    return NextResponse.redirect(new URL(home, request.url));
  }

  const primaryRole = getPrimaryRole(payload.roles || []);
  const allowedRoles = Object.entries(rolePermissions)
    .filter(([role]) => {
      const perms = rolePermissions[role as Role];
      return perms.some(route => pathname === route || pathname.startsWith(route + '/'));
    })
    .map(([role]) => role);

  if (!hasAnyRole(payload.roles || [], allowedRoles as Role[])) {
    const home = primaryRole === 'admin' ? '/' : primaryRole === 'gerente' ? '/relatorios' : '/meus-setores';
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg$).*)',
  ],
};