'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(formData);

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.success) {
        const roles = (res as any).roles as string[] || [];
        if (roles.includes('admin')) {
          router.push('/');
        } else {
          router.push('/meus-setores');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const map: Record<string, string> = {
      admin:     'Carlos Silva',
      gerente:   'Mariana Rocha',
      comprador: 'Ana Souza',
    };
    setUsername(map[role]);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1e40af] rounded-xl mb-4 shadow-lg shadow-blue-900/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight">Prado Trocas</h1>
          <p className="text-sm text-[#6b7280] mt-1">Gestão de Trocas Diárias</p>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 shadow-xl shadow-gray-200/50">
          <h2 className="text-lg font-semibold text-[#1f2937] mb-6">Acesse sua conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Usuário</label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="seu usuário"
                required
                className="w-full bg-[#f9fafb] border border-[#e5e7eb] hover:border-[#1e40af] focus:border-[#1e40af] text-[#1f2937] placeholder-[#9ca3af] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Senha</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#f9fafb] border border-[#e5e7eb] hover:border-[#1e40af] focus:border-[#1e40af] text-[#1f2937] placeholder-[#9ca3af] rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e5e7eb]">
            <p className="text-xs text-[#9ca3af] mb-3 text-center uppercase tracking-wide font-medium">Acesso rápido (demo)</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Admin', role: 'admin', bg: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' },
                { label: 'Gerente', role: 'gerente', bg: 'bg-sky-600 hover:bg-sky-700 text-white border-sky-700' },
                { label: 'Comprador', role: 'comprador', bg: 'bg-amber-500 hover:bg-amber-600 text-amber-900 border-amber-600' },
              ].map(({ label, role, bg }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(role)}
                  className={`text-xs font-semibold py-2.5 rounded-lg border transition-colors ${bg}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}