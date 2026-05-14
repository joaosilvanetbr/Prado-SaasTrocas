import React from 'react';

export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin w-5 h-5 text-[#6b7280] ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}