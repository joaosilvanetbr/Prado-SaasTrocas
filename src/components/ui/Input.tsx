import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: string;
  suffix?: string;
}

export default function Input({
  label,
  error,
  helperText,
  prefix,
  suffix,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#374151] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-white border rounded-lg text-[#1f2937] placeholder-[#9ca3af]
            focus:outline-none focus:ring-1 transition-colors
            ${prefix ? 'pl-8 pr-3' : suffix ? 'pl-3 pr-10' : 'px-3 py-2.5'}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300 focus:border-[#1e40af] focus:ring-[#1e40af]/20'}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {helperText && !error && <p className="text-[#9ca3af] text-xs mt-1">{helperText}</p>}
    </div>
  );
}