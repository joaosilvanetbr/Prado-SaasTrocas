import React from 'react';
import KPIGroup from '@/components/ui/KPICard';

interface KPICardsProps {
  realizado: number;
  meta: number;
}

export default function KPICards({ realizado, meta }: KPICardsProps) {
  return <KPIGroup realizado={realizado} meta={meta} />;
}