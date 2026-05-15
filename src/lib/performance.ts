export function calcularDiferenca(realizado: number, meta: number): number {
  return realizado - meta;
}

export function calcularPercentual(realizado: number, meta: number): number {
  if (meta === 0) return 0;
  return (realizado / meta) * 100;
}

export type StatusTrocas = 'critico' | 'acima' | 'atencao' | 'otimo';
export type StatusColor = 'danger' | 'warning' | 'success';

export function getStatusTrocas(realizado: number, meta: number): { status: StatusTrocas; color: StatusColor } {
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