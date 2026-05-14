import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-default-key');

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
  let setores: number[] = [];
  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const payload = verified.payload as unknown as UserPayload;
      if (payload?.roles) roles = payload.roles;
      if (payload?.setores) setores = payload.setores;
    } catch {
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar roles={roles} setores={setores} />
      <div className="flex-1 ml-64 min-h-screen">
        {children}
      </div>
    </div>
  );
}