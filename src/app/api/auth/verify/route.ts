import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

// ============================================
// VALIDAÇÃO DE TOKEN VIA COOKIE (Seguro)
// ============================================

export async function POST(request: Request) {
  try {
    // Em Next.js App Router, precisamos ler o cookie da requisição
    // A API route recebe cookies via headers
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Parsear o cookie auth_token
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );
    
    const token = cookies['auth_token'];
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    // Verificar token JWT
    const { payload } = await jwtVerify(token, getJwtSecret());
    
    return NextResponse.json({ payload });
  } catch (error) {
    console.error('[Auth Verify] Token inválido ou expirado:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
