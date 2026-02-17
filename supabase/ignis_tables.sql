-- =============================================
-- IGNIS — Vontade & Direccao Consciente
-- Chakra: Manipura (Plexo Solar)
-- Elemento: Fogo
-- =============================================

-- Clientes Ignis
CREATE TABLE IF NOT EXISTS ignis_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'activo',
  subscription_status TEXT DEFAULT NULL,
  subscription_expires TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  nivel TEXT DEFAULT 'Faisca',
  chamas_total INTEGER DEFAULT 0,
  streak_dias INTEGER DEFAULT 0,
  valores_definidos BOOLEAN DEFAULT false,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bussola de Valores (5 valores essenciais)
CREATE TABLE IF NOT EXISTS ignis_valores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  valores JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3 Escolhas Conscientes diarias
CREATE TABLE IF NOT EXISTS ignis_escolhas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  escolha_1 TEXT,
  escolha_2 TEXT,
  escolha_3 TEXT,
  reflexao_1 TEXT,
  reflexao_2 TEXT,
  reflexao_3 TEXT,
  alinhamento_valores JSONB DEFAULT '[]'::jsonb,
  review_nocturno TEXT,
  review_feito BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessoes de Foco Consciente
CREATE TABLE IF NOT EXISTS ignis_foco_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  duracao_minutos INTEGER,
  intencao_antes TEXT,
  reflexao_depois TEXT,
  aproximou_do_importante BOOLEAN,
  foco_nivel INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rastreador de Dispersao
CREATE TABLE IF NOT EXISTS ignis_dispersao_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  situacao TEXT,
  disse_sim_queria_nao BOOLEAN DEFAULT false,
  energia_gasta INTEGER DEFAULT 5,
  porque_disse_sim TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercicio de Corte Semanal
CREATE TABLE IF NOT EXISTS ignis_corte_semanal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  lista_10 JSONB DEFAULT '[]'::jsonb,
  cortadas JSONB DEFAULT '[]'::jsonb,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diario de Conquistas
CREATE TABLE IF NOT EXISTS ignis_conquistas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  conquista_1 TEXT,
  conquista_2 TEXT,
  conquista_3 TEXT,
  alinhada_com_valor TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desafios de Fogo
CREATE TABLE IF NOT EXISTS ignis_desafios_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  desafio_id TEXT,
  categoria TEXT,
  completou BOOLEAN DEFAULT false,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plano de Accao
CREATE TABLE IF NOT EXISTS ignis_plano_accao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  objectivo TEXT,
  valor_alinhado TEXT,
  passos JSONB DEFAULT '[]'::jsonb,
  prazo DATE,
  progresso INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS ignis_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDICES =====
CREATE INDEX IF NOT EXISTS idx_ignis_clients_user ON ignis_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ignis_escolhas_user_data ON ignis_escolhas(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_foco_user_data ON ignis_foco_sessions(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_dispersao_user ON ignis_dispersao_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_corte_user ON ignis_corte_semanal(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_conquistas_user ON ignis_conquistas_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_desafios_user ON ignis_desafios_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_plano_user ON ignis_plano_accao(user_id);
CREATE INDEX IF NOT EXISTS idx_ignis_chat_user ON ignis_chat_messages(user_id);

-- ===== RLS =====
ALTER TABLE ignis_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_valores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_escolhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_foco_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_dispersao_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_corte_semanal ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_conquistas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_desafios_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_plano_accao ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_chat_messages ENABLE ROW LEVEL SECURITY;

-- Politicas RLS (utilizadores so acedem aos seus proprios dados)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ignis_clients', 'ignis_valores', 'ignis_escolhas',
    'ignis_foco_sessions', 'ignis_dispersao_log', 'ignis_corte_semanal',
    'ignis_conquistas_log', 'ignis_desafios_log', 'ignis_plano_accao',
    'ignis_chat_messages'
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
