'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white items-center justify-center p-8">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <svg width="32" height="32" className="text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-[#1f2937] mb-2">Algo deu errado</h1>
      <p className="text-[#6b7280] mb-6 text-center max-w-md">{error.message || 'Ocorreu um erro inesperado.'}</p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-[#1e40af] text-white rounded-lg font-medium hover:bg-[#1e3a8a] transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}