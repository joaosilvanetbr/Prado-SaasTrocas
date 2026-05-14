'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { DeleteIcon } from '@/components/icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) {
  const iconBgClass = variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-blue-100';
  const iconColorClass = variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-blue-600';
  const confirmButtonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass}`}>
          <DeleteIcon className={iconColorClass} />
        </div>
        <div>
          <h3 className="text-[#1f2937] font-semibold">{title}</h3>
          <p className="text-[#6b7280] text-sm mt-1">{message}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={confirmButtonVariant} className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}