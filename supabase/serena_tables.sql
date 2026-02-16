-- ============================================================
-- SERENA — Tabelas Supabase
-- Eco 3: Emocao & Fluidez (Svadhisthana)
-- ============================================================

-- Clientes Serena (subscricoes, gamificacao)
CREATE TABLE IF NOT EXISTS serena_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'activo',
  subscription_status TEXT DEFAULT NULL,
  subscription_expires TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  pacote TEXT,
  fase_actual INTEGER DEFAULT 1,
  gotas_total INTEGER DEFAULT 0,
  streak_dias INTEGER DEFAULT 0,
  nivel TEXT DEFAULT 'Nascente',
  ultimo_checkin DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Log de emocoes (diario emocional)
CREATE TABLE IF NOT EXISTS serena_emocoes_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emocao TEXT NOT NULL,
  intensidade INTEGER CHECK (intensidade BETWEEN 1 AND 10),
  trigger TEXT,
  corpo_zona TEXT,
  reflexao TEXT,
  periodo TEXT CHECK (periodo IN ('manha', 'tarde', 'noite')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de respiracao
CREATE TABLE IF NOT EXISTS serena_respiracao_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tecnica TEXT NOT NULL,
  duracao_minutos NUMERIC(4,1),
  sensacao_antes TEXT,
  sensacao_depois TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de rituais de libertacao
CREATE TABLE IF NOT EXISTS serena_rituais_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_ritual TEXT NOT NULL,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de praticas de fluidez
CREATE TABLE IF NOT EXISTS serena_praticas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pratica_id TEXT NOT NULL,
  sentimento TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ciclo emocional
CREATE TABLE IF NOT EXISTS serena_ciclo_emocional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fase TEXT CHECK (fase IN ('acumulacao', 'pico', 'libertacao', 'calma')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ciclo menstrual (opcional)
CREATE TABLE IF NOT EXISTS serena_ciclo_menstrual (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fase_ciclo TEXT,
  emocao_correlacao TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS serena_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_serena_clients_user ON serena_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_serena_emocoes_user ON serena_emocoes_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_serena_respiracao_user ON serena_respiracao_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_serena_chat_user ON serena_chat_messages(user_id, created_at ASC);

-- RLS (Row Level Security)
ALTER TABLE serena_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_emocoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_respiracao_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_rituais_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_praticas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_ciclo_emocional ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_ciclo_menstrual ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_chat_messages ENABLE ROW LEVEL SECURITY;
