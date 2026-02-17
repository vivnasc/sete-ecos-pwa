-- =============================================
-- ECOA — Voz & Desbloqueio do Silencio
-- Chakra: Vishuddha (Garganta)
-- Elemento: Eter/Som
-- =============================================

-- Clientes Ecoa
CREATE TABLE IF NOT EXISTS ecoa_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'activo',
  subscription_status TEXT DEFAULT NULL,
  subscription_expires TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  nivel TEXT DEFAULT 'Sussurro',
  ecos_total INTEGER DEFAULT 0,
  streak_dias INTEGER DEFAULT 0,
  semana_micro_voz INTEGER DEFAULT 1,
  silenciamento_mapeado BOOLEAN DEFAULT false,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mapa de Silenciamento
CREATE TABLE IF NOT EXISTS ecoa_silenciamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  zonas JSONB DEFAULT '[]'::jsonb,
  pessoas JSONB DEFAULT '[]'::jsonb,
  verdades_nao_ditas JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Micro-Voz (exercicios progressivos)
CREATE TABLE IF NOT EXISTS ecoa_micro_voz_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  nivel_semana INTEGER,
  exercicio TEXT,
  completou BOOLEAN DEFAULT false,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voz Recuperada (tracking de coragem)
CREATE TABLE IF NOT EXISTS ecoa_voz_recuperada (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  o_que_disse TEXT,
  com_quem TEXT,
  sobre_o_que TEXT,
  como_correu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diario de Voz
CREATE TABLE IF NOT EXISTS ecoa_diario_voz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  tipo TEXT CHECK (tipo IN ('texto', 'audio')),
  conteudo TEXT,
  audio_url TEXT,
  duracao_segundos INTEGER,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cartas nao enviadas
CREATE TABLE IF NOT EXISTS ecoa_cartas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  destinatario TEXT,
  categoria TEXT CHECK (categoria IN ('perdao', 'raiva', 'gratidao', 'despedida', 'verdade')),
  conteudo TEXT,
  libertada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Afirmacoes diarias
CREATE TABLE IF NOT EXISTS ecoa_afirmacoes_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  afirmacoes JSONB DEFAULT '[]'::jsonb,
  padrao_silenciamento TEXT,
  gravou_audio BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercicios de expressao
CREATE TABLE IF NOT EXISTS ecoa_exercicios_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  tipo_exercicio TEXT,
  conteudo TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comunicacao assertiva
CREATE TABLE IF NOT EXISTS ecoa_comunicacao_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  situacao TEXT,
  como_comuniquei TEXT,
  como_gostaria TEXT,
  aprendizado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS ecoa_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDICES =====
CREATE INDEX IF NOT EXISTS idx_ecoa_clients_user ON ecoa_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ecoa_silenciamento_user ON ecoa_silenciamento(user_id);
CREATE INDEX IF NOT EXISTS idx_ecoa_micro_voz_user ON ecoa_micro_voz_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ecoa_voz_recuperada_user ON ecoa_voz_recuperada(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ecoa_diario_user ON ecoa_diario_voz(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ecoa_cartas_user ON ecoa_cartas(user_id);
CREATE INDEX IF NOT EXISTS idx_ecoa_afirmacoes_user ON ecoa_afirmacoes_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ecoa_exercicios_user ON ecoa_exercicios_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ecoa_comunicacao_user ON ecoa_comunicacao_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ecoa_chat_user ON ecoa_chat_messages(user_id);

-- ===== RLS =====
ALTER TABLE ecoa_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_silenciamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_micro_voz_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_voz_recuperada ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_diario_voz ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_cartas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_afirmacoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_exercicios_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_comunicacao_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ecoa_clients', 'ecoa_silenciamento', 'ecoa_micro_voz_log',
    'ecoa_voz_recuperada', 'ecoa_diario_voz', 'ecoa_cartas',
    'ecoa_afirmacoes_log', 'ecoa_exercicios_log', 'ecoa_comunicacao_log',
    'ecoa_chat_messages'
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
