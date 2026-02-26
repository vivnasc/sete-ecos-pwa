-- =====================================================
-- VITALIS - TABELAS DE REGISTO DE REFEIÇÕES
-- =====================================================
-- EXECUTAR NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
-- =====================================================

-- =====================================================
-- 1. TABELA: vitalis_refeicoes_config
-- Configuração das refeições do dia de cada utilizador
-- (ex: Pequeno-almoço, Almoço, Jantar, Lanche)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitalis_refeicoes_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  hora_habitual TEXT,
  ordem INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar refeições por utilizador
CREATE INDEX IF NOT EXISTS idx_refeicoes_config_user
  ON vitalis_refeicoes_config(user_id, activo);

-- RLS
ALTER TABLE vitalis_refeicoes_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal config"
  ON vitalis_refeicoes_config FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own meal config"
  ON vitalis_refeicoes_config FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own meal config"
  ON vitalis_refeicoes_config FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own meal config"
  ON vitalis_refeicoes_config FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));


-- =====================================================
-- 2. TABELA: vitalis_meals_log
-- Registo diário de refeições com porções (método da mão)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitalis_meals_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  refeicao TEXT NOT NULL,
  seguiu_plano TEXT CHECK (seguiu_plano IN ('sim', 'parcial', 'nao')),
  hora TEXT,
  porcoes_proteina NUMERIC(4,1) DEFAULT 0,
  porcoes_hidratos NUMERIC(4,1) DEFAULT 0,
  porcoes_gordura NUMERIC(4,1) DEFAULT 0,
  porcoes_legumes NUMERIC(4,1) DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um registo por refeição por dia
  UNIQUE(user_id, data, refeicao)
);

-- Índice para buscar registos por utilizador e data
CREATE INDEX IF NOT EXISTS idx_meals_log_user_data
  ON vitalis_meals_log(user_id, data);

-- RLS
ALTER TABLE vitalis_meals_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal logs"
  ON vitalis_meals_log FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own meal logs"
  ON vitalis_meals_log FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own meal logs"
  ON vitalis_meals_log FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own meal logs"
  ON vitalis_meals_log FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
