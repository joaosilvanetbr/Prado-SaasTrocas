import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-md shadow-[#1e40af]/20',
  secondary: 'bg-white border border-gray-300 text-[#374151] hover:bg-gray-50',
  ghost: 'bg-transparent text-[#6b7280] hover:bg-gray-100',
  danger: 'bg-[#dc2626] hover:bg-red-500 text-white',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}