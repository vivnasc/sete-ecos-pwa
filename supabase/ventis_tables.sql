-- =============================================
-- VENTIS — Energia & Ritmo
-- Chakra: Anahata (Coracao)
-- Elemento: Ar
-- =============================================

-- Clientes Ventis
CREATE TABLE IF NOT EXISTS ventis_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'activo',
  subscription_status TEXT DEFAULT NULL,
  subscription_expires TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  nivel TEXT DEFAULT 'Semente',
  folhas_total INTEGER DEFAULT 0,
  streak_dias INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitor de Energia (3x/dia)
CREATE TABLE IF NOT EXISTS ventis_energia_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  periodo TEXT NOT NULL CHECK (periodo IN ('manha', 'tarde', 'noite')),
  nivel INTEGER CHECK (nivel >= 0 AND nivel <= 100),
  sono_qualidade INTEGER,
  alimentacao_qualidade INTEGER,
  actividade_fisica BOOLEAN DEFAULT false,
  humor TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rotinas (matinal/nocturna)
CREATE TABLE IF NOT EXISTS ventis_rotinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('matinal', 'nocturna')),
  nome TEXT,
  blocos JSONB DEFAULT '[]'::jsonb,
  e_ritual BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de rotinas completadas
CREATE TABLE IF NOT EXISTS ventis_rotinas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rotina_id UUID REFERENCES ventis_rotinas(id) ON DELETE SET NULL,
  data DATE DEFAULT CURRENT_DATE,
  blocos_completados JSONB DEFAULT '[]'::jsonb,
  duracao_minutos INTEGER,
  sensacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pausas conscientes
CREATE TABLE IF NOT EXISTS ventis_pausas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  hora TIME,
  tipo_pausa TEXT,
  duracao_minutos INTEGER,
  exercicio TEXT,
  sensacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimento/Flow
CREATE TABLE IF NOT EXISTS ventis_movimento_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  tipo TEXT,
  duracao_minutos INTEGER,
  intensidade TEXT CHECK (intensidade IN ('suave', 'moderado', 'intenso')),
  sensacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conexao com a natureza
CREATE TABLE IF NOT EXISTS ventis_natureza_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  actividade TEXT,
  foto_url TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alertas de burnout
CREATE TABLE IF NOT EXISTS ventis_burnout_alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  dias_consecutivos INTEGER,
  nivel_medio INTEGER,
  accao_tomada TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS ventis_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDICES =====
CREATE INDEX IF NOT EXISTS idx_ventis_clients_user ON ventis_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ventis_energia_user_data ON ventis_energia_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_rotinas_user ON ventis_rotinas(user_id);
CREATE INDEX IF NOT EXISTS idx_ventis_rotinas_log_user ON ventis_rotinas_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_pausas_user ON ventis_pausas_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_movimento_user ON ventis_movimento_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_natureza_user ON ventis_natureza_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_burnout_user ON ventis_burnout_alertas(user_id);
CREATE INDEX IF NOT EXISTS idx_ventis_chat_user ON ventis_chat_messages(user_id);

-- ===== RLS =====
ALTER TABLE ventis_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_energia_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_rotinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_rotinas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_pausas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_movimento_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_natureza_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_burnout_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_chat_messages ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ventis_clients', 'ventis_energia_log', 'ventis_rotinas',
    'ventis_rotinas_log', 'ventis_pausas_log', 'ventis_movimento_log',
    'ventis_natureza_log', 'ventis_burnout_alertas', 'ventis_chat_messages'
  ])
  LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I_user_policy ON %I
      FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      )', t, t);
  END LOOP;
END $$;
