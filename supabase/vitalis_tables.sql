-- =====================================================
-- VITALIS - SCHEMA COMPLETO PARA SUPABASE
-- =====================================================
-- EXECUTAR NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
-- =====================================================

-- =====================================================
-- 1. TABELA: vitalis_intake (Questionário de Entrada)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitalis_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- DADOS PESSOAIS
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  idade INTEGER NOT NULL,
  sexo TEXT NOT NULL,

  -- MEDIDAS CORPORAIS
  altura_cm INTEGER NOT NULL CHECK (altura_cm >= 100 AND altura_cm <= 250),
  peso_actual NUMERIC(5,1) NOT NULL CHECK (peso_actual >= 20 AND peso_actual <= 300),
  peso_meta NUMERIC(5,1) NOT NULL CHECK (peso_meta >= 20 AND peso_meta <= 300),
  cintura_cm NUMERIC(5,1),
  anca_cm NUMERIC(5,1),

  -- OBJECTIVO
  objectivo_principal TEXT NOT NULL,
  prazo TEXT,
  porque_importante TEXT,

  -- ABORDAGEM ALIMENTAR
  abordagem_preferida TEXT,
  aceita_jejum BOOLEAN DEFAULT FALSE,
  restricoes_alimentares TEXT[],
  observa_ramadao TEXT,

  -- SAÚDE
  condicoes_saude TEXT[],
  medicacao TEXT,

  -- HÁBITOS ALIMENTARES
  refeicoes_dia INTEGER,
  pequeno_almoco TEXT,
  onde_come TEXT[],
  tipos_comida TEXT[],
  agua_litros_dia NUMERIC(3,1),
  bebidas TEXT[],
  freq_doces INTEGER,
  freq_fritos INTEGER,
  petisca BOOLEAN,
  o_que_petisca TEXT[],

  -- FOME EMOCIONAL (7 Emoções)
  freq_cansaco TEXT,
  freq_ansiedade TEXT,
  freq_tristeza TEXT,
  freq_raiva TEXT,
  freq_vazio TEXT,
  freq_solidao TEXT,
  freq_negacao TEXT,
  emocao_dominante TEXT,
  o_que_procura_comer TEXT[],
  como_sente_depois TEXT,
  quando_comecou_padrao TEXT,
  tentou_alternativas BOOLEAN,
  que_alternativas TEXT,

  -- ACTIVIDADE FÍSICA
  nivel_actividade TEXT,
  faz_exercicio BOOLEAN,
  tipo_exercicio TEXT[],

  -- SONO E STRESS
  horas_sono TEXT,
  qualidade_sono INTEGER,
  nivel_stress INTEGER,

  -- CONTEXTO
  situacao_profissional TEXT,
  situacao_familiar TEXT,
  filhos_pequenos BOOLEAN,
  quem_cozinha TEXT,

  -- HISTÓRICO DIETAS
  quantas_dietas TEXT,
  historico_dietas TEXT,
  dieta_funcionou TEXT,
  maior_obstaculo TEXT,
  gatilhos_sair_plano TEXT,

  -- PREFERÊNCIAS
  abordagem_realista TEXT,
  preferencias_alimentares TEXT,
  medir_pesar_comida TEXT,
  acesso_ingredientes TEXT,

  -- OUTRAS
  como_conheceu TEXT,
  o_que_espera_ganhar TEXT,
  observacoes_adicionais TEXT,
  prontidao_1a10 INTEGER CHECK (prontidao_1a10 >= 1 AND prontidao_1a10 <= 10),
  autoriza_dados_pesquisa BOOLEAN DEFAULT FALSE,

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user só tem 1 intake ativo
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vitalis_intake_user ON vitalis_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_vitalis_intake_email ON vitalis_intake(email);

-- =====================================================
-- 2. TABELA: vitalis_clients (Clientes Activos)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitalis_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- STATUS
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'pausado', 'cancelado')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'pending', 'expired', 'cancelled', 'tester')),

  -- DADOS DO PROGRAMA
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  fase_actual TEXT DEFAULT 'inducao' CHECK (fase_actual IN ('inducao', 'transicao', 'estabilizacao', 'recomposicao', 'intuitivo', 'manutencao')),
  duracao_programa TEXT DEFAULT '6_meses',
  pacote TEXT DEFAULT 'essencial',

  -- OBJECTIVO
  objectivo_principal TEXT,

  -- MEDIDAS
  peso_inicial NUMERIC(5,1) CHECK (peso_inicial >= 20 AND peso_inicial <= 300),
  peso_actual NUMERIC(5,1) CHECK (peso_actual >= 20 AND peso_actual <= 300),
  peso_meta NUMERIC(5,1) CHECK (peso_meta >= 20 AND peso_meta <= 300),
  imc_inicial NUMERIC(4,1) CHECK (imc_inicial IS NULL OR (imc_inicial >= 10 AND imc_inicial <= 100)),
  imc_actual NUMERIC(4,1) CHECK (imc_actual IS NULL OR (imc_actual >= 10 AND imc_actual <= 100)),

  -- EMOCIONAL
  emocao_dominante TEXT,
  prontidao_1a10 INTEGER CHECK (prontidao_1a10 >= 1 AND prontidao_1a10 <= 10),

  -- PAGAMENTO (campos adicionados via migration)
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'MZN',

  -- TRIAL/REFERRAL
  trial_started TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user só pode ser cliente uma vez
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vitalis_clients_user ON vitalis_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_vitalis_clients_status ON vitalis_clients(status);
CREATE INDEX IF NOT EXISTS idx_vitalis_clients_subscription ON vitalis_clients(subscription_status);

-- =====================================================
-- 3. TABELA: vitalis_meal_plans (Planos Alimentares)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitalis_meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- VERSÃO
  versao INTEGER DEFAULT 1,

  -- FASE E ABORDAGEM
  fase TEXT NOT NULL CHECK (fase IN ('inducao', 'transicao', 'estabilizacao', 'recomposicao', 'intuitivo', 'manutencao')),
  abordagem TEXT CHECK (abordagem IN ('keto_if', 'low_carb', 'equilibrado')),

  -- MACROS
  calorias_alvo INTEGER CHECK (calorias_alvo >= 1200 AND calorias_alvo <= 4000),
  proteina_g INTEGER,
  carboidratos_g INTEGER,
  gordura_g INTEGER,

  -- RECEITAS E CONFIGURAÇÕES
  receitas_incluidas JSONB,

  -- PESO NO MOMENTO DO PLANO
  peso_actual NUMERIC(5,1),
  peso_meta NUMERIC(5,1),

  -- STATUS
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'arquivado')),

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vitalis_meal_plans_user ON vitalis_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_vitalis_meal_plans_status ON vitalis_meal_plans(user_id, status);

-- =====================================================
-- 4. TABELA: vitalis_habitos (Hábitos Diários)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitalis_habitos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- HÁBITO
  habito TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('hidratacao', 'nutricao', 'sono', 'mindset', 'exercicio')),
  fase TEXT CHECK (fase IN ('inducao', 'transicao', 'estabilizacao', 'recomposicao', 'intuitivo', 'manutencao')),

  -- TRACKING
  data_inicio DATE DEFAULT CURRENT_DATE,
  dias_total INTEGER DEFAULT 14,
  dias_completos INTEGER DEFAULT 0,

  -- STATUS
  concluido BOOLEAN DEFAULT FALSE,

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vitalis_habitos_user ON vitalis_habitos(user_id);
CREATE INDEX IF NOT EXISTS idx_vitalis_habitos_fase ON vitalis_habitos(user_id, fase);

-- =====================================================
-- 5. TABELA: vitalis_checkins (Check-ins Diários)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitalis_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,

  -- DADOS
  peso NUMERIC(5,1),
  agua_litros NUMERIC(3,1),
  energia_nivel INTEGER CHECK (energia_nivel BETWEEN 1 AND 5),
  humor_nivel INTEGER CHECK (humor_nivel BETWEEN 1 AND 5),
  sono_qualidade INTEGER CHECK (sono_qualidade BETWEEN 1 AND 5),

  -- HÁBITOS
  seguiu_plano BOOLEAN,
  fez_exercicio BOOLEAN,
  notas TEXT,

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um check-in por dia
  UNIQUE(user_id, data)
);

CREATE INDEX IF NOT EXISTS idx_vitalis_checkins_user_data ON vitalis_checkins(user_id, data DESC);

-- =====================================================
-- 6. RLS (Row Level Security)
-- =====================================================

-- vitalis_intake
ALTER TABLE vitalis_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intake"
  ON vitalis_intake FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intake"
  ON vitalis_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intake"
  ON vitalis_intake FOR UPDATE
  USING (auth.uid() = user_id);

-- vitalis_clients
ALTER TABLE vitalis_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own client record"
  ON vitalis_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client record"
  ON vitalis_clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client record"
  ON vitalis_clients FOR UPDATE
  USING (auth.uid() = user_id);

-- vitalis_meal_plans
ALTER TABLE vitalis_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal plans"
  ON vitalis_meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON vitalis_meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON vitalis_meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- vitalis_habitos
ALTER TABLE vitalis_habitos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habitos"
  ON vitalis_habitos FOR ALL
  USING (auth.uid() = user_id);

-- vitalis_checkins
ALTER TABLE vitalis_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checkins"
  ON vitalis_checkins FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. TRIGGERS (Auto-update updated_at)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vitalis_intake_updated_at
  BEFORE UPDATE ON vitalis_intake
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vitalis_clients_updated_at
  BEFORE UPDATE ON vitalis_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vitalis_meal_plans_updated_at
  BEFORE UPDATE ON vitalis_meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vitalis_habitos_updated_at
  BEFORE UPDATE ON vitalis_habitos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. VERIFICAÇÃO FINAL
-- =====================================================

SELECT
  'vitalis_intake' AS tabela,
  count(*) AS registos
FROM vitalis_intake
UNION ALL
SELECT 'vitalis_clients', count(*) FROM vitalis_clients
UNION ALL
SELECT 'vitalis_meal_plans', count(*) FROM vitalis_meal_plans
UNION ALL
SELECT 'vitalis_habitos', count(*) FROM vitalis_habitos
UNION ALL
SELECT 'vitalis_checkins', count(*) FROM vitalis_checkins;

-- =====================================================
-- ✅ DONE!
-- =====================================================
-- Todas as tabelas criadas com:
-- - Validações de range (altura, peso, IMC)
-- - RLS configurado
-- - Índices otimizados
-- - Triggers de updated_at
-- =====================================================
