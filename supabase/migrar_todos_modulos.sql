-- ============================================================
-- SETE ECOS — MIGRACAO COMPLETA
-- Cria todas as tabelas dos 6 modulos novos
-- Executar no Supabase SQL Editor (ou via CLI)
-- Data: 2026-02-17
-- ============================================================
-- ORDEM: Serena -> Ignis -> Ventis -> Ecoa -> Imago -> Aurora
-- Todos usam IF NOT EXISTS — seguro para re-executar
-- ============================================================

-- =============================================
-- 1. SERENA — Emocao & Fluidez
-- =============================================

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

CREATE TABLE IF NOT EXISTS serena_respiracao_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tecnica TEXT NOT NULL,
  duracao_minutos NUMERIC(4,1),
  sensacao_antes TEXT,
  sensacao_depois TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serena_rituais_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_ritual TEXT NOT NULL,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serena_praticas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pratica_id TEXT NOT NULL,
  sentimento TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serena_ciclo_emocional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fase TEXT CHECK (fase IN ('acumulacao', 'pico', 'libertacao', 'calma')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serena_ciclo_menstrual (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fase_ciclo TEXT,
  emocao_correlacao TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serena_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_serena_clients_user ON serena_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_serena_emocoes_user ON serena_emocoes_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_serena_respiracao_user ON serena_respiracao_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_serena_chat_user ON serena_chat_messages(user_id, created_at ASC);

ALTER TABLE serena_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_emocoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_respiracao_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_rituais_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_praticas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_ciclo_emocional ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_ciclo_menstrual ENABLE ROW LEVEL SECURITY;
ALTER TABLE serena_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'serena_clients', 'serena_emocoes_log', 'serena_respiracao_log',
    'serena_rituais_log', 'serena_praticas_log', 'serena_ciclo_emocional',
    'serena_ciclo_menstrual', 'serena_chat_messages'
  ]) LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I_user_policy ON %I
      FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))', t, t);
  END LOOP;
END $$;

-- =============================================
-- 2. IGNIS — Vontade & Direccao Consciente
-- =============================================

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

CREATE TABLE IF NOT EXISTS ignis_valores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  valores JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ignis_escolhas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  escolha_1 TEXT, escolha_2 TEXT, escolha_3 TEXT,
  reflexao_1 TEXT, reflexao_2 TEXT, reflexao_3 TEXT,
  alinhamento_valores JSONB DEFAULT '[]'::jsonb,
  review_nocturno TEXT,
  review_feito BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS ignis_corte_semanal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  lista_10 JSONB DEFAULT '[]'::jsonb,
  cortadas JSONB DEFAULT '[]'::jsonb,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ignis_conquistas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  conquista_1 TEXT, conquista_2 TEXT, conquista_3 TEXT,
  alinhada_com_valor TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS ignis_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ignis_clients_user ON ignis_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ignis_escolhas_user_data ON ignis_escolhas(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_foco_user_data ON ignis_foco_sessions(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_dispersao_user ON ignis_dispersao_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_corte_user ON ignis_corte_semanal(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_conquistas_user ON ignis_conquistas_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_desafios_user ON ignis_desafios_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ignis_plano_user ON ignis_plano_accao(user_id);
CREATE INDEX IF NOT EXISTS idx_ignis_chat_user ON ignis_chat_messages(user_id);

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

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ignis_clients', 'ignis_valores', 'ignis_escolhas',
    'ignis_foco_sessions', 'ignis_dispersao_log', 'ignis_corte_semanal',
    'ignis_conquistas_log', 'ignis_desafios_log', 'ignis_plano_accao',
    'ignis_chat_messages'
  ]) LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I_user_policy ON %I
      FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))', t, t);
  END LOOP;
END $$;

-- =============================================
-- 3. VENTIS — Energia & Ritmo
-- =============================================

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

CREATE TABLE IF NOT EXISTS ventis_natureza_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  actividade TEXT,
  foto_url TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventis_burnout_alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  dias_consecutivos INTEGER,
  nivel_medio INTEGER,
  accao_tomada TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventis_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventis_clients_user ON ventis_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ventis_energia_user_data ON ventis_energia_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_rotinas_user ON ventis_rotinas(user_id);
CREATE INDEX IF NOT EXISTS idx_ventis_rotinas_log_user ON ventis_rotinas_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_pausas_user ON ventis_pausas_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_movimento_user ON ventis_movimento_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_natureza_user ON ventis_natureza_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_ventis_burnout_user ON ventis_burnout_alertas(user_id);
CREATE INDEX IF NOT EXISTS idx_ventis_chat_user ON ventis_chat_messages(user_id);

ALTER TABLE ventis_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_energia_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_rotinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_rotinas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_pausas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_movimento_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_natureza_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_burnout_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ventis_clients', 'ventis_energia_log', 'ventis_rotinas',
    'ventis_rotinas_log', 'ventis_pausas_log', 'ventis_movimento_log',
    'ventis_natureza_log', 'ventis_burnout_alertas', 'ventis_chat_messages'
  ]) LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I_user_policy ON %I
      FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))', t, t);
  END LOOP;
END $$;

-- =============================================
-- 4. ECOA — Voz & Desbloqueio do Silencio
-- =============================================

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

CREATE TABLE IF NOT EXISTS ecoa_silenciamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  zonas JSONB DEFAULT '[]'::jsonb,
  pessoas JSONB DEFAULT '[]'::jsonb,
  verdades_nao_ditas JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS ecoa_afirmacoes_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  afirmacoes JSONB DEFAULT '[]'::jsonb,
  padrao_silenciamento TEXT,
  gravou_audio BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ecoa_exercicios_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  tipo_exercicio TEXT,
  conteudo TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS ecoa_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ecoa_clients', 'ecoa_silenciamento', 'ecoa_micro_voz_log',
    'ecoa_voz_recuperada', 'ecoa_diario_voz', 'ecoa_cartas',
    'ecoa_afirmacoes_log', 'ecoa_exercicios_log', 'ecoa_comunicacao_log',
    'ecoa_chat_messages'
  ]) LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I_user_policy ON %I
      FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))', t, t);
  END LOOP;
END $$;

-- =============================================
-- 5. IMAGO — Identidade & Espelho
-- =============================================

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

CREATE TABLE IF NOT EXISTS imago_nomeacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome_actual TEXT,
  historico_nomes JSONB DEFAULT '[]'::jsonb,
  significado TEXT,
  data TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imago_identidade (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dimensao TEXT CHECK (dimensao IN ('corpo', 'valor', 'emocao', 'vontade', 'energia', 'voz', 'essencia')),
  conteudo TEXT,
  reflexao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dimensao)
);

CREATE TABLE IF NOT EXISTS imago_valores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  valores_top JSONB DEFAULT '[]'::jsonb,
  reflexoes JSONB DEFAULT '{}'::jsonb,
  revisao_data DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imago_roupa_identidade (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  o_que_visto TEXT,
  que_identidade TEXT,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imago_meditacoes_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  meditacao_id TEXT,
  duracao_minutos INTEGER,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imago_visao_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  items JSONB DEFAULT '[]'::jsonb,
  revisao_trimestral DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS imago_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'imago_clients', 'imago_espelho_triplo', 'imago_arqueologia',
    'imago_nomeacao', 'imago_identidade', 'imago_valores',
    'imago_roupa_identidade', 'imago_meditacoes_log', 'imago_visao_board',
    'imago_integracoes_log', 'imago_chat_messages'
  ]) LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I_user_policy ON %I
      FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))', t, t);
  END LOOP;
END $$;

-- =============================================
-- 6. AURORA — Integracao Final
-- =============================================

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

CREATE TABLE IF NOT EXISTS aurora_mentoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentora_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  frase_sabedoria TEXT,
  eco_referencia TEXT,
  semana DATE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aurora_ritual_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  componentes_feitos JSONB DEFAULT '[]'::jsonb,
  duracao_minutos INTEGER,
  reflexao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aurora_renovacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ano INTEGER,
  intencoes_novas JSONB DEFAULT '[]'::jsonb,
  o_que_mudou TEXT,
  cerimonia_data TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aurora_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aurora_clients_user ON aurora_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_graduacao_user ON aurora_graduacao(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_antes_depois_user ON aurora_antes_depois(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_manutencao_user ON aurora_manutencao_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_aurora_mentoria_mentora ON aurora_mentoria(mentora_user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_mentoria_semana ON aurora_mentoria(semana);
CREATE INDEX IF NOT EXISTS idx_aurora_ritual_user ON aurora_ritual_log(user_id, data);
CREATE INDEX IF NOT EXISTS idx_aurora_renovacao_user ON aurora_renovacao(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_chat_user ON aurora_chat_messages(user_id);

ALTER TABLE aurora_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_graduacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_antes_depois ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_manutencao_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_mentoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_ritual_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_renovacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'aurora_clients', 'aurora_graduacao', 'aurora_antes_depois',
    'aurora_manutencao_log', 'aurora_mentoria', 'aurora_ritual_log',
    'aurora_renovacao', 'aurora_chat_messages'
  ]) LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS %I_user_policy ON %I
      FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))', t, t);
  END LOOP;
END $$;

-- Mentoria tem politica especial: todas podem ler frases (anonimas)
CREATE POLICY IF NOT EXISTS aurora_mentoria_read_policy ON aurora_mentoria
FOR SELECT USING (true);

-- ============================================================
-- FIM DA MIGRACAO
-- Total: 55 tabelas novas (8 Serena + 10 Ignis + 9 Ventis + 10 Ecoa + 11 Imago + 8 Aurora)
-- ============================================================
