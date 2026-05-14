'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-backdrop-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-white border border-gray-200 rounded-xl w-full ${sizeStyles[size]} shadow-xl animate-scale-in`}>
        {(title || description) && (
          <div className="p-6 border-b border-gray-100">
            {title && <h3 className="text-lg font-bold text-[#1f2937]">{title}</h3>}
            {description && <p className="text-sm text-[#6b7280] mt-1">{description}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && <div className="p-6 border-t border-gray-100 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}