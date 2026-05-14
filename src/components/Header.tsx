import React from 'react';
import { cookies } from 'next/headers';

export default async function Header() {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value || 'admin'; // Padrão admin caso não logado
  const isAdmin = role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg leading-none">P</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Prado Trocas</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border bg-card rounded-md px-3 py-1.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span>Hoje, 14 Mai</span>
          </div>

          {isAdmin && (
            <>
              <button className="px-4 py-1.5 text-sm font-medium border border-border bg-card hover:bg-accent hover:text-accent-foreground rounded-md transition-all shadow-sm">
                Zerar
              </button>
              <button className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-all shadow-md shadow-primary/20">
                Salvar
              </button>
            </>
          )}
          
          <div className="ml-2 px-2 py-1 bg-muted text-muted-foreground rounded text-xs uppercase font-bold">
            {role}
          </div>
        </div>
      </div>
    </header>
  );
}
