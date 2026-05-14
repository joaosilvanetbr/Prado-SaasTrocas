import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/env";

export const runtime = 'edge';

interface UserPayload {
  sub: string;
  nome: string;
  roles: string[];
  setores: number[];
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let roles = ['admin'];
  if (token) {
    try {
      const verified = await jwtVerify(token, getJwtSecret());
      const payload = verified.payload as unknown as UserPayload;
      if (payload?.roles) roles = payload.roles;
    } catch {
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar roles={roles} />
      <div className="flex-1 ml-64 min-h-screen">
        {children}
      </div>
    </div>
  );
}