// Utilitários de sanitização para Prado-SaasTrocas

// ============================================
// SANITIZAÇÃO DE INPUTS
// ============================================

/**
 * Remove caracteres potencialmente perigosos de strings
 * Usado para sanitizar inputs de usuário antes de processar
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    // Remove null bytes e caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove tags HTML básicas
    .replace(/<[^>]*>/g, '')
    // Remove &不安全字符
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/gi, '')
    // Remove & hexadecimal
    .replace(/&#x?[0-9a-f]+;/gi, '')
    // Remove aspas duplas em excesso (mantém aspas simples para nomes)
    .replace(/"/g, "'")
    // Remove múltiplos espaços
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Sanitiza nome de usuário (mais restritivo)
 */
export function sanitizeUsername(input: string): string {
  if (!input) return '';
  
  return input
    // Aceita apenas letras, números, underscore, espaço, hífen, ponto
    .replace(/[^a-zA-Z0-9_ çáàâãéèêíìóòôõúùûñ-]/g, '')
    // Remove múltiplos espaços
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
    // Limita tamanho
    .slice(0, 100);
}

/**
 * Valida se uma string contém apenas caracteres seguros
 */
export function isSafeString(input: string): boolean {
  if (!input) return true;
  
  // Verifica se não contém scripts ou XSS básico
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitiza input para uso em queries (prevenção de SQL injection)
 * Nota: Drizzle ORM já usa parameterized queries, mas isso adiciona uma camada extra
 */
export function sanitizeForQuery(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '')
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}

/**
 * Validação de nome completo
 */
export function isValidName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }
  
  if (name.trim().length > 100) {
    return { valid: false, error: 'Nome deve ter no máximo 100 caracteres' };
  }
  
  if (!isSafeString(name)) {
    return { valid: false, error: 'Nome contém caracteres inválidos' };
  }
  
  return { valid: true };
}

/**
 * Validação de senha
 */
export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Senha é obrigatória' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  }
  
  if (password.length > 100) {
    return { valid: false, error: 'Senha deve ter no máximo 100 caracteres' };
  }
  
  return { valid: true };
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  sanitizeString,
  sanitizeUsername,
  sanitizeForQuery,
  isSafeString,
  isValidName,
  isValidPassword,
};