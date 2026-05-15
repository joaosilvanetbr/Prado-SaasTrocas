import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecret());
    return NextResponse.json({ payload });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}