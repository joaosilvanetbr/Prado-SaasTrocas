import MeusSetoresClient from './MeusSetoresClient';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db';
import { sectors } from '@/db/schema';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';
import type { D1Database } from '@cloudflare/workers-types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Meus Setores | Prado Trocas",
  description: "Visão dos setores atribuídos ao usuário.",
};

export default async function MeusSetoresPage() {
  let userSetores: number[] = [];
  let isAdmin = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      const verified = await jwtVerify(token, getJwtSecret());
      const payload = verified.payload as { roles?: string[]; setores?: number[] };
      userSetores = payload?.setores || [];
      const userRoles: string[] = payload?.roles || [];
      isAdmin = userRoles.includes('admin');
    }

    const env = getRequestContext().env as { DB?: D1Database };
    if (env?.DB) {
      const db = getDb(env.DB);
      await db.select().from(sectors);
    }
  } catch {
    // Use fallback values
  }

  return <MeusSetoresClient userSetores={userSetores} isAdmin={isAdmin} />;
}