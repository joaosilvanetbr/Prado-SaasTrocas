// Logger estruturado para Prado-SaasTrocas

// ============================================
// NÍVEIS DE LOG
// ============================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

// ============================================
// CONFIGURAÇÃO
// ============================================

const isDevelopment = process.env.NODE_ENV === 'development';

function shouldLog(level: LogLevel): boolean {
  if (isDevelopment) return true;
  // Em produção, apenas WARN e ERROR
  return level >= LogLevel.WARN;
}

// ============================================
// LOGGER
// ============================================

export interface LogContext {
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${LOG_LABELS[level]}]`;
  
  const logObj = {
    timestamp,
    level: LOG_LABELS[level],
    message,
    ...context,
  };
  
  return JSON.stringify(logObj);
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.DEBUG)) {
      if (isDevelopment) {
        console.debug(formatMessage(LogLevel.DEBUG, message, context));
      }
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.INFO)) {
      if (isDevelopment) {
        console.info(formatMessage(LogLevel.INFO, message, context));
      } else {
        console.log(formatMessage(LogLevel.INFO, message, context));
      }
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage(LogLevel.WARN, message, context));
    }
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog(LogLevel.ERROR)) {
      const errorInfo = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error: String(error) };
      
      console.error(formatMessage(LogLevel.ERROR, message, { ...context, ...errorInfo }));
    }
  },
};

// ============================================
// HELPERS DE PERFORMANCE
// ============================================

export function measureTime<T>(
  label: string,
  fn: () => T | Promise<T>,
  onComplete?: (duration: number, result: T) => void
): T {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((resolved) => {
      const duration = performance.now() - start;
      logger.info(`⏱ ${label}`, { duration_ms: Math.round(duration) });
      onComplete?.(duration, resolved);
      return resolved;
    }) as T;
  } else {
    const duration = performance.now() - start;
    logger.debug(`⏱ ${label}`, { duration_ms: Math.round(duration) });
    onComplete?.(duration, result);
    return result;
  }
}

export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  logger.info(`⏱ ${label}`, { duration_ms: Math.round(duration) });
  
  return result;
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default logger;