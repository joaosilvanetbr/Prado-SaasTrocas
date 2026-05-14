'use client';

import { formatCurrency, formatPercent, formatDate, formatDateLong } from '@/lib/format';

export function useFormatter() {
  return {
    currency: formatCurrency,
    percent: formatPercent,
    date: formatDate,
    dateLong: formatDateLong,
  };
}