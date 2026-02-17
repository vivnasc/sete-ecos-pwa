-- =============================================
-- IMAGO — Identidade & Espelho
-- Chakra: Sahasrara (Coroa)
-- Elemento: Consciencia
-- =============================================

-- Clientes Imago
CREATE TABLE IF NOT EXISTS imago_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'activo',
  subscription_status TEXT DEFAULT NULL,
  subscription_expires TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  nivel TEXT DEFAULT 'Reflexo',
  estrelas_total INTEGER DEFAULT 0,
  streak_dias INTEGER DEFAULT 0,
  espelho_completado BOOLEAN DEFAULT false,
  nomeacao_actual TEXT,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Espelho Triplo (CORE: essencia vs mascara vs aspiracao)
CREATE TABLE IF NOT EXISTS imago_espelho_triplo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  essencia TEXT,
  mascara TEXT,
  aspiracao TEXT,
  gaps JSONB DEFAULT '[]'::jsonb,
  mascaras_identificadas JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Arqueologia de Si (escavacao de identidade)
CREATE TABLE IF NOT EXISTS imago_arqueologia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  camada TEXT,
  antes_de_x TEXT,
  versao_presa TEXT,
  identidade_alheia TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nomeacao (ritual de auto-nomeacao)
CREATE TABLE IF NOT EXISTS imago_nomeacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome_actual TEXT,
  historico_nomes JSONB DEFAULT '[]'::jsonb,
  significado TEXT,
  data TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mapa de Identidade (7 dimensoes, uma por eco)
CREATE TABLE IF NOT EXISTS imago_identidade (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dimensao TEXT CHECK (dimensao IN ('corpo', 'valor', 'emocao', 'vontade', 'energia', 'voz', 'essencia')),
  conteudo TEXT,
  reflexao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dimensao)
);

-- Valores Essenciais (50 -> 10 -> 5 -> top 3)
CREATE TABLE IF NOT EXISTS imago_valores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  valores_top JSONB DEFAULT '[]'::jsonb,
  reflexoes JSONB DEFAULT '{}'::jsonb,
  revisao_data DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roupa como Identidade
CREATE TABLE IF NOT EXISTS imago_roupa_identidade (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  o_que_visto TEXT,
  que_identidade TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meditacoes de Essencia
CREATE TABLE IF NOT EXISTS imago_meditacoes_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  meditacao_id TEXT,
  duracao_minutos INTEGER,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visao Board (quadro de visao digital)
CREATE TABLE IF NOT EXISTS imago_visao_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  items JSONB DEFAULT '[]'::jsonb,
  revisao_trimestral DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integracoes entre Ecos
CREATE TABLE IF NOT EXISTS imago_integracoes_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  eco_1 TEXT,
  eco_2 TEXT,
  insight TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS imago_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDICES =====
CREATE INDEX IF NOT EXISTS idx_imago_clients_user ON imago_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_imago_espelho_user ON imago_espelho_triplo(user_id);
CREATE INDEX IF NOT EXISTS idx_imago_arqueologia_user ON imago_arqueologia(user_id, data);
CREATE INDEX IF NOT EXISTS idx_imago_nomeacao_user ON imago_nomeacao(user_id);
CREATE INDEX IF NOT EXISTS idx_imago_identidade_user ON imago_identidade(user_id);
CREATE INDEX IF NOT EXISTS idx_imago_valores_user ON imago_valores(user_id);
CREATE INDEX IF NOT EXISTS idx_imago_roupa_user ON imago_roupa_identidade(user_id, data);
CREATE INDEX IF NOT EXISTS idx_imago_meditacoes_user ON imago_meditacoes_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_imago_visao_user ON imago_visao_board(user_id);
CREATE INDEX IF NOT EXISTS idx_imago_integracoes_user ON imago_integracoes_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_imago_chat_user ON imago_chat_messages(user_id);

-- ===== RLS =====
ALTER TABLE imago_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_espelho_triplo ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_arqueologia ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_nomeacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_identidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_valores ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_roupa_identidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_meditacoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_visao_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_integracoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'imago_clients', 'imago_espelho_triplo', 'imago_arqueologia',
    'imago_nomeacao', 'imago_identidade', 'imago_valores',
    'imago_roupa_identidade', 'imago_meditacoes_log', 'imago_visao_board',
    'imago_integracoes_log', 'imago_chat_messages'
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
