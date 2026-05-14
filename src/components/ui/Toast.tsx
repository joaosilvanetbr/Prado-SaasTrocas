'use client';

import React, { useEffect } from 'react';
import { CheckIcon, WarningIcon, InfoIcon } from '@/components/icons';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: number;
  message: string;
  variant?: ToastVariant;
  autoDismiss?: number;
  onClose: (id: number) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-green-400',
  error: 'border-red-400',
  warning: 'border-amber-400',
  info: 'border-blue-400',
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckIcon className="text-green-600" />,
  error: <WarningIcon className="text-red-600" />,
  warning: <WarningIcon className="text-amber-600" />,
  info: <InfoIcon className="text-blue-600" />,
};

function ToastItem({ id, message, variant = 'info', autoDismiss = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), autoDismiss);
    return () => clearTimeout(timer);
  }, [id, autoDismiss, onClose]);

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg px-4 py-3 flex items-center gap-3 animate-scale-in z-50 border-2 shadow-lg ${variantStyles[variant]}`}>
      {variantIcons[variant]}
      <span className="text-[#1f2937] text-sm font-medium">{message}</span>
    </div>
  );
}

interface Toast {
  id: number;
  message: string;
  variant?: ToastVariant;
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: number) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <>
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = (message: string, variant: ToastVariant = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
  };
}