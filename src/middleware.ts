import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { rolePermissions, type Role } from '@/lib/permissions';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-default-key');

interface UserPayload {
  sub: string;
  nome: string;
  roles?: string[];
  setores?: number[];
}

function getPrimaryRole(payload: UserPayload): Role {
  if (!payload.roles || payload.roles.length === 0) return 'comprador';
  if (payload.roles.includes('admin')) return 'admin';
  if (payload.roles.includes('gerente')) return 'gerente';
  return 'comprador';
}

function hasAnyRole(payload: UserPayload, allowedRoles: string[]): boolean {
  if (!payload.roles || payload.roles.length === 0) return false;
  return payload.roles.some(r => allowedRoles.includes(r));
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login');

  let payload: UserPayload | null = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
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
    const primaryRole = getPrimaryRole(payload);
    const home = primaryRole === 'admin' ? '/' : '/meus-setores';
    return NextResponse.redirect(new URL(home, request.url));
  }

  const primaryRole = getPrimaryRole(payload);
  const allowedRoles = Object.entries(rolePermissions)
    .filter(([role]) => {
      const perms = rolePermissions[role as Role];
      return perms.some(route => pathname === route || pathname.startsWith(route + '/'));
    })
    .map(([role]) => role);

  if (!hasAnyRole(payload, allowedRoles)) {
    const home = primaryRole === 'admin' ? '/' : '/meus-setores';
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg$).*)',
  ],
};