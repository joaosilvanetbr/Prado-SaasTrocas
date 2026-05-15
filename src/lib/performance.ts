export function calcularDiferenca(realizado: number, meta: number): number {
  return realizado - meta;
}

export function calcularPercentual(realizado: number, meta: number): number {
  if (meta === 0) return 0;
  return (realizado / meta) * 100;
}

export type StatusTrocas = 'critico' | 'acima' | 'atencao' | 'otimo' | 'sem_lancamento';
export type StatusColor = 'danger' | 'warning' | 'success' | 'neutral';

export function getStatusTrocas(realizado: number, meta: number, hasReport?: boolean): { status: StatusTrocas; color: StatusColor } {
  if (hasReport === false) {
    return { status: 'sem_lancamento', color: 'neutral' };
  }

  const percentual = calcularPercentual(realizado, meta);

  if (percentual >= 130) {
    return { status: 'critico', color: 'danger' };
  }
  if (percentual > 100) {
    return { status: 'acima', color: 'danger' };
  }
  if (percentual >= 80) {
    return { status: 'atencao', color: 'warning' };
  }
  return { status: 'otimo', color: 'success' };
}

export function getPerformanceColor(realizado: number, meta: number, hasReport?: boolean): StatusColor {
  return getStatusTrocas(realizado, meta, hasReport).color;
}