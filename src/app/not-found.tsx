import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white items-center justify-center p-8">
      <div className="w-20 h-20 rounded-full bg-[#1e40af]/10 flex items-center justify-center mb-6">
        <svg width="40" height="40" className="text-[#1e40af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h1 className="text-6xl font-bold text-[#1f2937] mb-2">404</h1>
      <h2 className="text-xl font-semibold text-[#1f2937] mb-2">Página não encontrada</h2>
      <p className="text-[#6b7280] mb-8 text-center max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/">
        <Button variant="primary">Voltar ao início</Button>
      </Link>
    </div>
  );
}