import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';
import { db } from '@/db';
import { sectors } from '@/db/schema';
import { asc } from 'drizzle-orm';
import UsuariosClient from './UsuariosClient';

interface UserPayload {
  sub: string;
  nome: string;
  roles: string[];
  setores: number[];
}

export const metadata = {
  title: 'Usuários | Prado Trocas',
};

export default async function UsuariosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let currentUserId = 0;
  let currentUserNome = '';

  if (token) {
    try {
      const verified = await jwtVerify(token, getJwtSecret());
      const payload = verified.payload as unknown as UserPayload;
      if (payload) {
        currentUserId = parseInt(payload.sub) || 0;
        currentUserNome = payload.nome || '';
      }
    } catch {
    }
  }

  // Fetch sectors for the form
  let sectorsList: { id: number; nome: string }[] = [];
  try {
    const sectorsResult = await db.select({
      id: sectors.id,
      nome: sectors.nome,
    }).from(sectors).orderBy(asc(sectors.nome));
    sectorsList = sectorsResult;
  } catch {
    // ignore
  }

  return <UsuariosClient 
    currentUserId={currentUserId} 
    currentUserNome={currentUserNome}
    sectorsList={sectorsList}
  />;
}