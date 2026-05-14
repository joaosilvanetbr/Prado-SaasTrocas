import React from 'react';

type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-md',
  bordered: 'bg-white border-2 border-gray-300',
};

export default function Card({ variant = 'default', className = '', children }: CardProps) {
  return (
    <div className={`rounded-xl p-5 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}