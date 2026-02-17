-- =============================================
-- AURORA — Integracao Final
-- Elemento: Luz
-- Celebracao da jornada completa
-- =============================================

-- Clientes Aurora
CREATE TABLE IF NOT EXISTS aurora_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'activo',
  subscription_status TEXT DEFAULT NULL,
  subscription_expires TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  raios_total INTEGER DEFAULT 0,
  graduacao_data TIMESTAMPTZ,
  ecos_completados JSONB DEFAULT '[]'::jsonb,
  modo_manutencao BOOLEAN DEFAULT false,
  mentora BOOLEAN DEFAULT false,
  renovacao_data TIMESTAMPTZ,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cerimonia de Graduacao
CREATE TABLE IF NOT EXISTS aurora_graduacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data TIMESTAMPTZ DEFAULT NOW(),
  ecos_incluidos JSONB DEFAULT '[]'::jsonb,
  mensagem_pessoal TEXT,
  certificado_url TEXT,
  momentos_chave JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Antes vs Depois (narrativa de transformacao)
CREATE TABLE IF NOT EXISTS aurora_antes_depois (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  quem_eras TEXT,
  que_feridas TEXT,
  o_que_soltaste TEXT,
  quem_es_agora TEXT,
  carta_antes TEXT,
  carta_agora TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins de Manutencao (mensais)
CREATE TABLE IF NOT EXISTS aurora_manutencao_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  mes_referencia TEXT,
  estado_geral TEXT,
  padroes_regressao JSONB DEFAULT '[]'::jsonb,
  conquistas_mes JSONB DEFAULT '[]'::jsonb,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentoria (anonima)
CREATE TABLE IF NOT EXISTS aurora_mentoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentora_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  frase_sabedoria TEXT,
  eco_referencia TEXT,
  semana DATE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ritual Aurora (matinal integrado)
CREATE TABLE IF NOT EXISTS aurora_ritual_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  componentes_feitos JSONB DEFAULT '[]'::jsonb,
  duracao_minutos INTEGER,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Renovacao Anual
CREATE TABLE IF NOT EXISTS aurora_renovacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ano INTEGER,
  intencoes_novas JSONB DEFAULT '[]'::jsonb,
  o_que_mudou TEXT,
  cerimonia_data TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS aurora_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDICES =====
CREATE INDEX IF NOT EXISTS idx_aurora_clients_user ON aurora_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_graduacao_user ON aurora_graduacao(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_antes_depois_user ON aurora_antes_depois(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_manutencao_user ON aurora_manutencao_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_aurora_mentoria_mentora ON aurora_mentoria(mentora_user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_mentoria_semana ON aurora_mentoria(semana);
CREATE INDEX IF NOT EXISTS idx_aurora_ritual_user ON aurora_ritual_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_aurora_renovacao_user ON aurora_renovacao(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_chat_user ON aurora_chat_messages(user_id);

-- ===== RLS =====
ALTER TABLE aurora_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_graduacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_antes_depois ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_manutencao_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_mentoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_ritual_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_renovacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'aurora_clients', 'aurora_graduacao', 'aurora_antes_depois',
    'aurora_manutencao_log', 'aurora_ritual_log',
    'aurora_renovacao', 'aurora_chat_messages'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_user_policy ON %I', t, t);
    EXECUTE format('
      CREATE POLICY %I_user_policy ON %I
      FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      )', t, t);
  END LOOP;
END $$;

-- Mentoria usa mentora_user_id (nao user_id) + leitura publica
DROP POLICY IF EXISTS aurora_mentoria_user_policy ON aurora_mentoria;
CREATE POLICY aurora_mentoria_user_policy ON aurora_mentoria
FOR ALL USING (mentora_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS aurora_mentoria_read_policy ON aurora_mentoria;
CREATE POLICY aurora_mentoria_read_policy ON aurora_mentoria
FOR SELECT USING (true);
