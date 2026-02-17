-- ============================================================
-- SETE ECOS — SCHEMA COMPLETO DOS MODULOS ECO
-- Tabelas _clients para todos os 6 modulos novos
-- ============================================================
-- EXECUTAR NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
-- ============================================================
-- Seguro para re-executar: usa CREATE TABLE IF NOT EXISTS
-- e DROP POLICY IF EXISTS antes de cada CREATE POLICY
-- ============================================================
-- Data: 2026-02-17
-- Modulos: Serena, Ignis, Ventis, Ecoa, Imago, Aurora
-- ============================================================


-- ============================================================
-- 0. FUNCAO TRIGGER: updated_at (criada se nao existir)
-- ============================================================
-- Esta funcao e partilhada por todas as tabelas que precisam
-- de auto-update do campo updated_at ao fazer UPDATE.
-- Ja existe no vitalis_tables.sql, mas usamos CREATE OR REPLACE
-- para seguranca.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. SERENA — Emocao & Fluidez
-- Chakra: Svadhisthana (Sacral)
-- Elemento: Agua
-- ============================================================
-- Tabela de clientes do modulo Serena.
-- Gere subscricoes, estado emocional e nivel de fluidez.
-- Colunas especificas: emocao_dominante, nivel_fluidez,
-- ultimo_checkin_emocional

CREATE TABLE IF NOT EXISTS serena_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- STATUS
  status TEXT DEFAULT 'activo'
    CHECK (status IN ('activo', 'inactivo', 'pausado', 'cancelado')),
  subscription_status TEXT DEFAULT NULL
    CHECK (subscription_status IS NULL OR subscription_status IN ('tester', 'trial', 'active', 'pending', 'expired', 'cancelled')),
  subscription_expires TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,

  -- PAGAMENTO
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'MZN',

  -- PACOTE & DATAS
  pacote TEXT CHECK (pacote IS NULL OR pacote IN ('monthly', 'semestral', 'annual')),
  data_inicio DATE DEFAULT CURRENT_DATE,

  -- COLUNAS ESPECIFICAS SERENA
  emocao_dominante TEXT,                        -- emocao principal do utilizador
  nivel_fluidez INTEGER DEFAULT 1               -- nivel de fluidez emocional (progressao)
    CHECK (nivel_fluidez >= 1 AND nivel_fluidez <= 10),
  ultimo_checkin_emocional TIMESTAMPTZ,          -- data/hora do ultimo check-in emocional

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user so pode ser cliente uma vez
  UNIQUE(user_id)
);

COMMENT ON TABLE serena_clients IS 'Clientes do modulo Serena (Emocao & Fluidez). Chakra Svadhisthana. Gere subscricoes e estado emocional.';
COMMENT ON COLUMN serena_clients.emocao_dominante IS 'Emocao dominante actual do utilizador (ex: ansiedade, tristeza, raiva)';
COMMENT ON COLUMN serena_clients.nivel_fluidez IS 'Nivel de fluidez emocional de 1 a 10, progride com pratica';
COMMENT ON COLUMN serena_clients.ultimo_checkin_emocional IS 'Timestamp do ultimo check-in emocional registado';


-- ============================================================
-- 2. IGNIS — Vontade & Direccao Consciente
-- Chakra: Manipura (Plexo Solar)
-- Elemento: Fogo
-- ============================================================
-- Tabela de clientes do modulo Ignis.
-- Gere subscricoes, foco actual e disciplina.
-- Colunas especificas: foco_actual, nivel_disciplina,
-- escolhas_feitas

CREATE TABLE IF NOT EXISTS ignis_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- STATUS
  status TEXT DEFAULT 'activo'
    CHECK (status IN ('activo', 'inactivo', 'pausado', 'cancelado')),
  subscription_status TEXT DEFAULT NULL
    CHECK (subscription_status IS NULL OR subscription_status IN ('tester', 'trial', 'active', 'pending', 'expired', 'cancelled')),
  subscription_expires TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,

  -- PAGAMENTO
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'MZN',

  -- PACOTE & DATAS
  pacote TEXT CHECK (pacote IS NULL OR pacote IN ('monthly', 'semestral', 'annual')),
  data_inicio DATE DEFAULT CURRENT_DATE,

  -- COLUNAS ESPECIFICAS IGNIS
  foco_actual TEXT,                              -- area de foco actual do utilizador
  nivel_disciplina INTEGER DEFAULT 1             -- nivel de disciplina (progressao)
    CHECK (nivel_disciplina >= 1 AND nivel_disciplina <= 10),
  escolhas_feitas INTEGER DEFAULT 0              -- total de escolhas conscientes registadas
    CHECK (escolhas_feitas >= 0),

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user so pode ser cliente uma vez
  UNIQUE(user_id)
);

COMMENT ON TABLE ignis_clients IS 'Clientes do modulo Ignis (Vontade & Direccao). Chakra Manipura. Gere subscricoes, foco e disciplina.';
COMMENT ON COLUMN ignis_clients.foco_actual IS 'Area de foco actual (ex: carreira, saude, relacoes)';
COMMENT ON COLUMN ignis_clients.nivel_disciplina IS 'Nivel de disciplina de 1 a 10, progride com pratica diaria';
COMMENT ON COLUMN ignis_clients.escolhas_feitas IS 'Contador total de escolhas conscientes registadas no modulo';


-- ============================================================
-- 3. VENTIS — Energia & Ritmo
-- Chakra: Anahata (Coracao)
-- Elemento: Ar
-- ============================================================
-- Tabela de clientes do modulo Ventis.
-- Gere subscricoes, nivel de energia e ritmo.
-- Colunas especificas: nivel_energia, ritmo_preferido,
-- burnout_score

CREATE TABLE IF NOT EXISTS ventis_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- STATUS
  status TEXT DEFAULT 'activo'
    CHECK (status IN ('activo', 'inactivo', 'pausado', 'cancelado')),
  subscription_status TEXT DEFAULT NULL
    CHECK (subscription_status IS NULL OR subscription_status IN ('tester', 'trial', 'active', 'pending', 'expired', 'cancelled')),
  subscription_expires TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,

  -- PAGAMENTO
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'MZN',

  -- PACOTE & DATAS
  pacote TEXT CHECK (pacote IS NULL OR pacote IN ('monthly', 'semestral', 'annual')),
  data_inicio DATE DEFAULT CURRENT_DATE,

  -- COLUNAS ESPECIFICAS VENTIS
  nivel_energia TEXT,                            -- nivel de energia actual (baixo, medio, alto)
  ritmo_preferido TEXT,                          -- ritmo preferido do utilizador (matinal, nocturno, flexivel)
  burnout_score INTEGER                          -- score de burnout (0-100, null se nao avaliado)
    CHECK (burnout_score IS NULL OR (burnout_score >= 0 AND burnout_score <= 100)),

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user so pode ser cliente uma vez
  UNIQUE(user_id)
);

COMMENT ON TABLE ventis_clients IS 'Clientes do modulo Ventis (Energia & Ritmo). Chakra Anahata. Gere subscricoes, energia e risco de burnout.';
COMMENT ON COLUMN ventis_clients.nivel_energia IS 'Nivel de energia actual reportado (ex: baixo, medio, alto)';
COMMENT ON COLUMN ventis_clients.ritmo_preferido IS 'Ritmo circadiano preferido (ex: matinal, nocturno, flexivel)';
COMMENT ON COLUMN ventis_clients.burnout_score IS 'Score de risco de burnout de 0 a 100, calculado a partir dos check-ins';


-- ============================================================
-- 4. ECOA — Voz & Desbloqueio do Silencio
-- Chakra: Vishuddha (Garganta)
-- Elemento: Eter/Som
-- ============================================================
-- Tabela de clientes do modulo Ecoa.
-- Gere subscricoes, nivel de voz e desbloqueio do silencio.
-- Colunas especificas: nivel_voz, silenciamentos_mapeados,
-- micro_voz_semana

CREATE TABLE IF NOT EXISTS ecoa_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- STATUS
  status TEXT DEFAULT 'activo'
    CHECK (status IN ('activo', 'inactivo', 'pausado', 'cancelado')),
  subscription_status TEXT DEFAULT NULL
    CHECK (subscription_status IS NULL OR subscription_status IN ('tester', 'trial', 'active', 'pending', 'expired', 'cancelled')),
  subscription_expires TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,

  -- PAGAMENTO
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'MZN',

  -- PACOTE & DATAS
  pacote TEXT CHECK (pacote IS NULL OR pacote IN ('monthly', 'semestral', 'annual')),
  data_inicio DATE DEFAULT CURRENT_DATE,

  -- COLUNAS ESPECIFICAS ECOA
  nivel_voz INTEGER DEFAULT 1                    -- nivel de expressao vocal (progressao)
    CHECK (nivel_voz >= 1 AND nivel_voz <= 10),
  silenciamentos_mapeados INTEGER DEFAULT 0      -- total de padroes de silenciamento identificados
    CHECK (silenciamentos_mapeados >= 0),
  micro_voz_semana INTEGER DEFAULT 0             -- semana actual no programa de micro-voz
    CHECK (micro_voz_semana >= 0),

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user so pode ser cliente uma vez
  UNIQUE(user_id)
);

COMMENT ON TABLE ecoa_clients IS 'Clientes do modulo Ecoa (Voz & Expressao). Chakra Vishuddha. Gere subscricoes e desbloqueio do silencio.';
COMMENT ON COLUMN ecoa_clients.nivel_voz IS 'Nivel de expressao vocal de 1 a 10, progride com exercicios de micro-voz';
COMMENT ON COLUMN ecoa_clients.silenciamentos_mapeados IS 'Quantidade de padroes de silenciamento identificados pelo utilizador';
COMMENT ON COLUMN ecoa_clients.micro_voz_semana IS 'Semana actual no programa progressivo de micro-voz';


-- ============================================================
-- 5. IMAGO — Identidade & Espelho
-- Chakra: Ajna (Terceiro Olho)
-- Elemento: Consciencia
-- ============================================================
-- Tabela de clientes do modulo Imago.
-- Gere subscricoes, fase de identidade e auto-conhecimento.
-- Colunas especificas: fase_identidade, valores_definidos,
-- espelho_completo

CREATE TABLE IF NOT EXISTS imago_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- STATUS
  status TEXT DEFAULT 'activo'
    CHECK (status IN ('activo', 'inactivo', 'pausado', 'cancelado')),
  subscription_status TEXT DEFAULT NULL
    CHECK (subscription_status IS NULL OR subscription_status IN ('tester', 'trial', 'active', 'pending', 'expired', 'cancelled')),
  subscription_expires TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,

  -- PAGAMENTO
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'MZN',

  -- PACOTE & DATAS
  pacote TEXT CHECK (pacote IS NULL OR pacote IN ('monthly', 'semestral', 'annual')),
  data_inicio DATE DEFAULT CURRENT_DATE,

  -- COLUNAS ESPECIFICAS IMAGO
  fase_identidade TEXT,                          -- fase actual na jornada de identidade
  valores_definidos BOOLEAN DEFAULT FALSE,       -- se o utilizador ja definiu os seus valores essenciais
  espelho_completo BOOLEAN DEFAULT FALSE,        -- se o exercicio do espelho triplo foi completado

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user so pode ser cliente uma vez
  UNIQUE(user_id)
);

COMMENT ON TABLE imago_clients IS 'Clientes do modulo Imago (Identidade & Espelho). Chakra Ajna. Gere subscricoes e jornada de auto-conhecimento.';
COMMENT ON COLUMN imago_clients.fase_identidade IS 'Fase actual na jornada de identidade (ex: escavacao, nomeacao, integracao)';
COMMENT ON COLUMN imago_clients.valores_definidos IS 'Indica se o utilizador completou o exercicio de definicao de valores essenciais';
COMMENT ON COLUMN imago_clients.espelho_completo IS 'Indica se o exercicio do espelho triplo (essencia/mascara/aspiracao) foi completado';


-- ============================================================
-- 6. AURORA — Integracao Final
-- Elemento: Luz
-- Celebracao da jornada completa dos 7 Ecos
-- ============================================================
-- Tabela de clientes do modulo Aurora.
-- Gere subscricoes, graduacao e modo de manutencao.
-- Colunas especificas: ecos_completados (array),
-- graduacao_data, modo_manutencao

CREATE TABLE IF NOT EXISTS aurora_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- STATUS
  status TEXT DEFAULT 'activo'
    CHECK (status IN ('activo', 'inactivo', 'pausado', 'cancelado')),
  subscription_status TEXT DEFAULT NULL
    CHECK (subscription_status IS NULL OR subscription_status IN ('tester', 'trial', 'active', 'pending', 'expired', 'cancelled')),
  subscription_expires TIMESTAMPTZ,
  subscription_updated TIMESTAMPTZ,
  trial_started TIMESTAMPTZ,

  -- PAGAMENTO
  payment_method TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'MZN',

  -- PACOTE & DATAS
  pacote TEXT CHECK (pacote IS NULL OR pacote IN ('monthly', 'semestral', 'annual')),
  data_inicio DATE DEFAULT CURRENT_DATE,

  -- COLUNAS ESPECIFICAS AURORA
  ecos_completados TEXT[] DEFAULT '{}',           -- array de nomes de ecos completados (ex: {'vitalis','serena','ignis'})
  graduacao_data TIMESTAMPTZ,                    -- data da cerimonia de graduacao
  modo_manutencao BOOLEAN DEFAULT FALSE,         -- se o utilizador esta em modo manutencao pos-graduacao

  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um user so pode ser cliente uma vez
  UNIQUE(user_id)
);

COMMENT ON TABLE aurora_clients IS 'Clientes do modulo Aurora (Integracao Final). Celebracao da jornada completa. Gere graduacao e manutencao.';
COMMENT ON COLUMN aurora_clients.ecos_completados IS 'Array de nomes dos ecos completados pelo utilizador (ex: vitalis, serena, ignis)';
COMMENT ON COLUMN aurora_clients.graduacao_data IS 'Data/hora em que o utilizador completou a cerimonia de graduacao';
COMMENT ON COLUMN aurora_clients.modo_manutencao IS 'Indica se o utilizador esta em modo de manutencao pos-graduacao';


-- ============================================================
-- 7. INDICES
-- ============================================================
-- Indices em user_id para performance nas queries de acesso
-- por utilizador (a query mais frequente em todas as tabelas).

-- Serena
CREATE INDEX IF NOT EXISTS idx_serena_clients_user ON serena_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_serena_clients_status ON serena_clients(status);
CREATE INDEX IF NOT EXISTS idx_serena_clients_subscription ON serena_clients(subscription_status);

-- Ignis
CREATE INDEX IF NOT EXISTS idx_ignis_clients_user ON ignis_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ignis_clients_status ON ignis_clients(status);
CREATE INDEX IF NOT EXISTS idx_ignis_clients_subscription ON ignis_clients(subscription_status);

-- Ventis
CREATE INDEX IF NOT EXISTS idx_ventis_clients_user ON ventis_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ventis_clients_status ON ventis_clients(status);
CREATE INDEX IF NOT EXISTS idx_ventis_clients_subscription ON ventis_clients(subscription_status);

-- Ecoa
CREATE INDEX IF NOT EXISTS idx_ecoa_clients_user ON ecoa_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_ecoa_clients_status ON ecoa_clients(status);
CREATE INDEX IF NOT EXISTS idx_ecoa_clients_subscription ON ecoa_clients(subscription_status);

-- Imago
CREATE INDEX IF NOT EXISTS idx_imago_clients_user ON imago_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_imago_clients_status ON imago_clients(status);
CREATE INDEX IF NOT EXISTS idx_imago_clients_subscription ON imago_clients(subscription_status);

-- Aurora
CREATE INDEX IF NOT EXISTS idx_aurora_clients_user ON aurora_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_aurora_clients_status ON aurora_clients(status);
CREATE INDEX IF NOT EXISTS idx_aurora_clients_subscription ON aurora_clients(subscription_status);


-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Cada utilizador so pode ver e modificar os seus proprios dados.
-- Usa a tabela users intermediaria (users.auth_id = auth.uid()).
-- Padrao consistente com os restantes modulos (Aurea, etc.).

-- Habilitar RLS em todas as tabelas
ALTER TABLE serena_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ignis_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventis_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoa_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE imago_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_clients ENABLE ROW LEVEL SECURITY;

-- Politicas RLS: SELECT (ver so os proprios dados)
DROP POLICY IF EXISTS "serena_clients_select_policy" ON serena_clients;
CREATE POLICY "serena_clients_select_policy" ON serena_clients
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ignis_clients_select_policy" ON ignis_clients;
CREATE POLICY "ignis_clients_select_policy" ON ignis_clients
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ventis_clients_select_policy" ON ventis_clients;
CREATE POLICY "ventis_clients_select_policy" ON ventis_clients
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ecoa_clients_select_policy" ON ecoa_clients;
CREATE POLICY "ecoa_clients_select_policy" ON ecoa_clients
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "imago_clients_select_policy" ON imago_clients;
CREATE POLICY "imago_clients_select_policy" ON imago_clients
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "aurora_clients_select_policy" ON aurora_clients;
CREATE POLICY "aurora_clients_select_policy" ON aurora_clients
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Politicas RLS: INSERT (inserir so os proprios dados)
DROP POLICY IF EXISTS "serena_clients_insert_policy" ON serena_clients;
CREATE POLICY "serena_clients_insert_policy" ON serena_clients
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ignis_clients_insert_policy" ON ignis_clients;
CREATE POLICY "ignis_clients_insert_policy" ON ignis_clients
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ventis_clients_insert_policy" ON ventis_clients;
CREATE POLICY "ventis_clients_insert_policy" ON ventis_clients
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ecoa_clients_insert_policy" ON ecoa_clients;
CREATE POLICY "ecoa_clients_insert_policy" ON ecoa_clients
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "imago_clients_insert_policy" ON imago_clients;
CREATE POLICY "imago_clients_insert_policy" ON imago_clients
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "aurora_clients_insert_policy" ON aurora_clients;
CREATE POLICY "aurora_clients_insert_policy" ON aurora_clients
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Politicas RLS: UPDATE (actualizar so os proprios dados)
DROP POLICY IF EXISTS "serena_clients_update_policy" ON serena_clients;
CREATE POLICY "serena_clients_update_policy" ON serena_clients
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ignis_clients_update_policy" ON ignis_clients;
CREATE POLICY "ignis_clients_update_policy" ON ignis_clients
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ventis_clients_update_policy" ON ventis_clients;
CREATE POLICY "ventis_clients_update_policy" ON ventis_clients
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "ecoa_clients_update_policy" ON ecoa_clients;
CREATE POLICY "ecoa_clients_update_policy" ON ecoa_clients
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "imago_clients_update_policy" ON imago_clients;
CREATE POLICY "imago_clients_update_policy" ON imago_clients
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "aurora_clients_update_policy" ON aurora_clients;
CREATE POLICY "aurora_clients_update_policy" ON aurora_clients
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));


-- ============================================================
-- 9. TRIGGERS (Auto-update updated_at)
-- ============================================================
-- Cada tabela _clients recebe um trigger que actualiza
-- automaticamente o campo updated_at sempre que um UPDATE
-- e executado na linha.

-- Serena
DROP TRIGGER IF EXISTS update_serena_clients_updated_at ON serena_clients;
CREATE TRIGGER update_serena_clients_updated_at
  BEFORE UPDATE ON serena_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ignis
DROP TRIGGER IF EXISTS update_ignis_clients_updated_at ON ignis_clients;
CREATE TRIGGER update_ignis_clients_updated_at
  BEFORE UPDATE ON ignis_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ventis
DROP TRIGGER IF EXISTS update_ventis_clients_updated_at ON ventis_clients;
CREATE TRIGGER update_ventis_clients_updated_at
  BEFORE UPDATE ON ventis_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ecoa
DROP TRIGGER IF EXISTS update_ecoa_clients_updated_at ON ecoa_clients;
CREATE TRIGGER update_ecoa_clients_updated_at
  BEFORE UPDATE ON ecoa_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Imago
DROP TRIGGER IF EXISTS update_imago_clients_updated_at ON imago_clients;
CREATE TRIGGER update_imago_clients_updated_at
  BEFORE UPDATE ON imago_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aurora
DROP TRIGGER IF EXISTS update_aurora_clients_updated_at ON aurora_clients;
CREATE TRIGGER update_aurora_clients_updated_at
  BEFORE UPDATE ON aurora_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 10. FUNCAO AUXILIAR: UPSERT seguro para cada modulo
-- ============================================================
-- Funcao generica para criar/actualizar registo de cliente
-- com ON CONFLICT no user_id. Util para o fluxo de subscricao.

CREATE OR REPLACE FUNCTION upsert_eco_client(
  p_table_name TEXT,
  p_user_id UUID,
  p_subscription_status TEXT DEFAULT NULL,
  p_pacote TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL,
  p_payment_amount NUMERIC DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'INSERT INTO %I (user_id, subscription_status, pacote, payment_method, payment_reference, payment_amount, data_inicio)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
     ON CONFLICT (user_id) DO UPDATE SET
       subscription_status = COALESCE($2, %I.subscription_status),
       pacote = COALESCE($3, %I.pacote),
       payment_method = COALESCE($4, %I.payment_method),
       payment_reference = COALESCE($5, %I.payment_reference),
       payment_amount = COALESCE($6, %I.payment_amount),
       subscription_updated = NOW()',
    p_table_name,
    p_table_name, p_table_name, p_table_name,
    p_table_name, p_table_name
  )
  USING p_user_id, p_subscription_status, p_pacote,
        p_payment_method, p_payment_reference, p_payment_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION upsert_eco_client IS 'Funcao generica para criar ou actualizar um registo de cliente em qualquer tabela _clients dos eco modulos. Usa ON CONFLICT para seguranca.';


-- ============================================================
-- 11. VERIFICACAO FINAL
-- ============================================================
-- Query de verificacao: mostra contagem de registos em cada
-- tabela _clients para confirmar que todas existem.

SELECT
  'serena_clients' AS tabela,
  count(*) AS registos
FROM serena_clients
UNION ALL
SELECT 'ignis_clients', count(*) FROM ignis_clients
UNION ALL
SELECT 'ventis_clients', count(*) FROM ventis_clients
UNION ALL
SELECT 'ecoa_clients', count(*) FROM ecoa_clients
UNION ALL
SELECT 'imago_clients', count(*) FROM imago_clients
UNION ALL
SELECT 'aurora_clients', count(*) FROM aurora_clients;


-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
-- Resumo:
--   6 tabelas _clients criadas (IF NOT EXISTS)
--   18 indices criados (3 por tabela: user_id, status, subscription_status)
--   18 politicas RLS (SELECT, INSERT, UPDATE por tabela)
--   6 triggers de auto-update (updated_at)
--   1 funcao partilhada (update_updated_at_column)
--   1 funcao auxiliar (upsert_eco_client)
--
-- Colunas comuns a todas as tabelas:
--   id, user_id, status, subscription_status, subscription_expires,
--   subscription_updated, trial_started, payment_method,
--   payment_reference, payment_amount, payment_currency,
--   pacote, data_inicio, created_at, updated_at
--
-- Colunas especificas:
--   serena: emocao_dominante, nivel_fluidez, ultimo_checkin_emocional
--   ignis:  foco_actual, nivel_disciplina, escolhas_feitas
--   ventis: nivel_energia, ritmo_preferido, burnout_score
--   ecoa:   nivel_voz, silenciamentos_mapeados, micro_voz_semana
--   imago:  fase_identidade, valores_definidos, espelho_completo
--   aurora: ecos_completados (text[]), graduacao_data, modo_manutencao
-- ============================================================
