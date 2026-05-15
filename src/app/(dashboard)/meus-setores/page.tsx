import MeusSetoresClient from './MeusSetoresClient';
import { db } from '@/db';
import { sectors } from '@/db/schema';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Meus Setores | Prado Trocas",
  description: "Visão dos setores atribuídos ao usuário.",
};

export default async function MeusSetoresPage() {
  let userSetores: number[] = [];
  let isAdmin = false;
  let totalSetores = 0;

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

    const allSectors = await db.select().from(sectors);
    totalSetores = allSectors.length;
  } catch {
  }

  return <MeusSetoresClient userSetores={userSetores} isAdmin={isAdmin} totalSetores={totalSetores} />;
}