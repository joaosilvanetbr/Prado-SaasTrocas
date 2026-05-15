// Sistema de erros padronizado para Prado-SaasTrocas

// ============================================
// CÓDIGOS DE ERRO
// ============================================

export enum ErrorCode {
  // Autenticação
  UNAUTHORIZED = 'AUTH_001',
  INVALID_CREDENTIALS = 'AUTH_002',
  TOKEN_EXPIRED = 'AUTH_003',
  TOKEN_INVALID = 'AUTH_004',
  RATE_LIMITED = 'AUTH_005',

  // Validação
  VALIDATION_ERROR = 'VAL_001',
  INVALID_INPUT = 'VAL_002',

  // Banco de dados
  DB_CONNECTION_ERROR = 'DB_001',
  DB_QUERY_ERROR = 'DB_002',

  // Recursos
  NOT_FOUND = 'RES_001',
  DUPLICATE_ENTRY = 'RES_002',
  CONSTRAINT_VIOLATION = 'RES_003',

  // Genérico
  INTERNAL_ERROR = 'INT_001',
}

// ============================================
// CLASSE AppError
// ============================================

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, code: ErrorCode, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
    };
  }
}

// ============================================
// ERROS PRÉ-DEFINIDOS
// ============================================

export const Errors = {
  unauthorized: () => new AppError('Não autenticado', ErrorCode.UNAUTHORIZED, 401),
  invalidCredentials: () => new AppError('Credenciais inválidas', ErrorCode.INVALID_CREDENTIALS, 401),
  tokenExpired: () => new AppError('Sessão expirada', ErrorCode.TOKEN_EXPIRED, 401),
  tokenInvalid: () => new AppError('Token inválido', ErrorCode.TOKEN_INVALID, 401),
  rateLimited: () => new AppError('Muitas tentativas. Tente novamente em alguns minutos.', ErrorCode.RATE_LIMITED, 429),
  validationError: (details: string) => new AppError(details, ErrorCode.VALIDATION_ERROR, 400),
  invalidInput: (field: string) => new AppError(`${field} é obrigatório ou contém dados inválidos`, ErrorCode.INVALID_INPUT, 400),
  dbConnection: () => new AppError('Erro ao conectar ao banco de dados', ErrorCode.DB_CONNECTION_ERROR, 503),
  dbQuery: () => new AppError('Erro ao executar operação no banco de dados', ErrorCode.DB_QUERY_ERROR, 500),
  notFound: (resource: string) => new AppError(`${resource} não encontrado`, ErrorCode.NOT_FOUND, 404),
  duplicateEntry: (resource: string) => new AppError(`${resource} já existe`, ErrorCode.DUPLICATE_ENTRY, 409),
  constraintViolation: (message: string) => new AppError(message, ErrorCode.CONSTRAINT_VIOLATION, 409),
  internalError: () => new AppError('Erro interno do servidor', ErrorCode.INTERNAL_ERROR, 500),
};

// ============================================
// HANDLERS DE ACTION
// ============================================

export type ActionResult =
  | { success: true; [key: string]: unknown }
  | { error: string; code?: string };

/**
 * Wrapper para actions server que captura erros e retorna formato padronizado
 */
export async function handleActionError<T>(
  operation: () => Promise<T>,
  fallbackMessage = 'Erro ao processar requisição'
): Promise<ActionResult> {
  try {
    const result = await operation();
    return { success: true, ...result } as ActionResult;
  } catch (error) {
    console.error('[Action Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    if (error instanceof AppError) {
      return { error: error.message, code: error.code };
    }

    return { error: fallbackMessage };
  }
}

/**
 * Helper para validações que retorna erro formatado
 */
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw Errors.invalidInput(fieldName);
  }
}

/**
 * Helper para validações de schema Zod
 */
export function validateSchema<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; error?: { issues: { message: string }[] }; data?: T } },
  data: unknown,
  fallbackMessage = 'Dados inválidos'
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const messages = result.error?.issues.map(i => i.message).join(', ') || fallbackMessage;
    throw Errors.validationError(messages);
  }
  
  if (result.data === undefined) {
    throw Errors.validationError(fallbackMessage);
  }
  
  return result.data;
}

// ============================================
// LOGGING CONTEXTUAL
// ============================================

export function logError(context: string, error: unknown, additional?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    context,
    timestamp,
    error: error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
    } : String(error),
    ...additional,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', JSON.stringify(errorInfo, null, 2));
  } else {
    // Em produção, enviar para serviço de monitoramento (ex: Sentry)
    console.error(JSON.stringify(errorInfo));
  }
}