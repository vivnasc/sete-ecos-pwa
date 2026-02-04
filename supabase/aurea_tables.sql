-- =====================================================
-- ÁUREA - Tabelas Supabase
-- Módulo: Valor & Presença (2º Eco)
-- =====================================================

-- Tabela principal de clientes ÁUREA
CREATE TABLE IF NOT EXISTS aurea_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Subscrição
  subscription_status TEXT DEFAULT NULL, -- tester, trial, active, pending, expired, cancelled
  subscription_expires TIMESTAMPTZ,
  subscription_plan TEXT, -- monthly, semestral, annual
  subscription_updated TIMESTAMPTZ,
  subscription_notes TEXT,

  -- Trial
  trial_started TIMESTAMPTZ,

  -- Pagamento
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount DECIMAL(10,2),
  payment_currency TEXT DEFAULT 'MZN',
  payer_email TEXT,

  -- Quota de Presença
  quota_tempo_horas INTEGER DEFAULT 2,
  quota_dinheiro_mzn INTEGER DEFAULT 100,
  quota_energia_actividades INTEGER DEFAULT 1,

  -- Gamificação
  joias_total INTEGER DEFAULT 0,
  streak_quota INTEGER DEFAULT 0,
  melhor_streak INTEGER DEFAULT 0,
  badges_desbloqueados JSONB DEFAULT '[]'::jsonb,

  -- Onboarding
  onboarding_complete BOOLEAN DEFAULT FALSE,
  onboarding_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Log de alterações de subscrição
CREATE TABLE IF NOT EXISTS aurea_subscription_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_status TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins diários da Quota
CREATE TABLE IF NOT EXISTS aurea_checkins_quota (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  resposta TEXT NOT NULL, -- sim, parcial, nao
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- Log de práticas completadas
CREATE TABLE IF NOT EXISTS aurea_praticas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pratica_id TEXT NOT NULL,
  data DATE NOT NULL,
  categoria TEXT,
  nivel_culpa TEXT, -- sem, leve, muita
  joias_ganhas INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de jóias ganhas
CREATE TABLE IF NOT EXISTS aurea_joias_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL,
  motivo TEXT NOT NULL, -- quota_cumprida, pratica_completada, roupa_checkin, etc
  pratica_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de culpa (para detectar padrões)
CREATE TABLE IF NOT EXISTS aurea_culpa_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pratica_id TEXT,
  nivel TEXT NOT NULL, -- leve, muita
  frase TEXT, -- frase de culpa seleccionada
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins semanais de roupa
CREATE TABLE IF NOT EXISTS aurea_roupa_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL, -- início da semana
  modo_dominante TEXT, -- sustenta, neutra, disfarça
  usou_peca_guardada BOOLEAN DEFAULT FALSE,
  sentimento TEXT, -- presente, funcional, invisível
  tem_pecas_guardadas TEXT, -- muitas, algumas, nao
  joias_ganhas INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- Peças do guarda-roupa
CREATE TABLE IF NOT EXISTS aurea_roupa_pecas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL, -- sustenta, neutra, disfarça, antiga
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carteira de Merecimento (gastos semanais)
CREATE TABLE IF NOT EXISTS aurea_carteira (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  semana DATE NOT NULL, -- início da semana
  gasto_mim DECIMAL(10,2) DEFAULT 0,
  gasto_casa DECIMAL(10,2) DEFAULT 0,
  gasto_outros DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  percentagem_mim INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, semana)
);

-- Diário de Merecimento
CREATE TABLE IF NOT EXISTS aurea_diario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  texto TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- =====================================================
-- ÍNDICES para performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_aurea_clients_user ON aurea_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_aurea_checkins_quota_user_data ON aurea_checkins_quota(user_id, data);
CREATE INDEX IF NOT EXISTS idx_aurea_praticas_log_user_data ON aurea_praticas_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_aurea_joias_log_user ON aurea_joias_log(user_id);
CREATE INDEX IF NOT EXISTS idx_aurea_carteira_user_semana ON aurea_carteira(user_id, semana);
CREATE INDEX IF NOT EXISTS idx_aurea_diario_user_data ON aurea_diario(user_id, data);

-- =====================================================
-- RLS (Row Level Security) - Opcional mas recomendado
-- =====================================================

-- Habilitar RLS
ALTER TABLE aurea_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_subscription_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_checkins_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_praticas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_joias_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_culpa_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_roupa_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_roupa_pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_carteira ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurea_diario ENABLE ROW LEVEL SECURITY;

-- Políticas: utilizadores só vêem os seus próprios dados
CREATE POLICY "Users can view own aurea_clients" ON aurea_clients
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_subscription_log" ON aurea_subscription_log
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_checkins_quota" ON aurea_checkins_quota
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_praticas_log" ON aurea_praticas_log
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_joias_log" ON aurea_joias_log
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_culpa_log" ON aurea_culpa_log
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_roupa_checkins" ON aurea_roupa_checkins
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_roupa_pecas" ON aurea_roupa_pecas
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_carteira" ON aurea_carteira
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own aurea_diario" ON aurea_diario
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
