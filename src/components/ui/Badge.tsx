import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-[#ffff00] text-[#999900] border-[#ffcc00]/30',
  error: 'bg-red-100 text-red-600 border-red-200',
  info: 'bg-blue-100 text-blue-600 border-blue-200',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function Badge({ variant = 'info', size = 'md', className = '', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}