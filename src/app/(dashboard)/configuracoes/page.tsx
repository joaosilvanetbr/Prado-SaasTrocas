import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';
import ConfiguracoesClient from './ConfiguracoesClient';

interface UserPayload {
  sub: string;
  nome: string;
  roles: string[];
  setores: number[];
}

export const metadata = {
  title: 'Configurações | Prado Trocas',
};

export default async function ConfiguracoesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let user = { id: 0, nome: 'Usuário', roles: ['admin'], setores: [] as number[] };

  if (token) {
    try {
      const verified = await jwtVerify(token, getJwtSecret());
      const payload = verified.payload as unknown as UserPayload;
      if (payload) {
        user = {
          id: parseInt(payload.sub) || 0,
          nome: payload.nome || 'Usuário',
          roles: payload.roles || ['admin'],
          setores: payload.setores || [],
        };
      }
    } catch {
    }
  }

  return <ConfiguracoesClient user={user} />;
}