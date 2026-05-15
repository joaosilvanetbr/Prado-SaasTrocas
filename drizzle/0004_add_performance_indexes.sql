-- Migration: Add performance indexes
-- Description: Adiciona índices para melhorar performance em queries frequentes

-- ============================================
-- ÍNDICES PARA daily_reports
-- ============================================

-- Índice para busca por data (relatórios históricos)
CREATE INDEX IF NOT EXISTS idx_daily_reports_date 
ON daily_reports(date);

-- Índice para busca por setor + data (filtros comuns)
CREATE INDEX IF NOT EXISTS idx_daily_reports_sector_date 
ON daily_reports(sector_id, date);

-- Índice para busca composite (date + sector_id) - útil para dashboards
CREATE INDEX IF NOT EXISTS idx_daily_reports_date_sector 
ON daily_reports(date, sector_id);

-- ============================================
-- ÍNDICES PARA users
-- ============================================

-- Índice para busca por nome (login)
CREATE INDEX IF NOT EXISTS idx_users_nome 
ON users(nome);

-- Índice para busca por role (filtros de permissão)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- ============================================
-- ÍNDICES PARA sectors
-- ============================================

-- Índice para busca por comprador (relatórios por comprador)
CREATE INDEX IF NOT EXISTS idx_sectors_comprador 
ON sectors(comprador_id);

-- ============================================
-- COMENTÁRIOS (Documentação)
-- ============================================

COMMENT ON INDEX idx_daily_reports_date IS 'Índice para busca de relatórios por data';
COMMENT ON INDEX idx_daily_reports_sector_date IS 'Índice para busca de relatórios por setor e data';
COMMENT ON INDEX idx_daily_reports_date_sector IS 'Índice para dashboards e relatórios consolidados';
COMMENT ON INDEX idx_users_nome IS 'Índice para busca de usuários no login';
COMMENT ON INDEX idx_users_role IS 'Índice para filtros de permissão';
COMMENT ON INDEX idx_sectors_comprador IS 'Índice para busca de setores por comprador';