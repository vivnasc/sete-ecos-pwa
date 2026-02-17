-- =====================================================
-- LUMINA - SCHEMA COMPLETO PARA SUPABASE
-- =====================================================
-- EXECUTAR NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
-- =====================================================

-- =====================================================
-- 1. TABELA: lumina_checkins (Check-ins Diários)
-- =====================================================
-- Guarda as 8 respostas de cada check-in Lumina.
-- Cada resposta é uma string (e.g., 'pesado', 'baixa', 'calma').
-- Opcionalmente inclui fase e dia do ciclo menstrual.
-- =====================================================

CREATE TABLE IF NOT EXISTS lumina_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Data do check-in (YYYY-MM-DD)
  data DATE NOT NULL DEFAULT CURRENT_DATE,

  -- 8 RESPOSTAS (strings — valores possíveis por dimensão)
  -- corpo: pesado | tenso | normal | solto | leve
  corpo TEXT NOT NULL,
  -- passado: preso | apesar | normal | arrumado | leve
  passado TEXT NOT NULL,
  -- impulso: esconder | parar | nada | decidir | agir
  impulso TEXT NOT NULL,
  -- futuro: escuro | pesado | normal | claro | luminoso
  futuro TEXT NOT NULL,
  -- mente: caotica | barulhenta | normal | calma | silenciosa
  mente TEXT NOT NULL,
  -- energia: vazia | baixa | normal | boa | cheia
  energia TEXT NOT NULL,
  -- espelho: invisivel | apagada | normal | visivel | luminosa
  espelho TEXT NOT NULL,
  -- cuidado: esquecida | por ultimo | normal | presente | prioritaria
  cuidado TEXT NOT NULL,

  -- CICLO MENSTRUAL (opcional)
  fase_ciclo TEXT,        -- menstrual | folicular | ovulacao | lutea
  dia_ciclo INTEGER,      -- 1-35

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_lumina_checkins_user_id
  ON lumina_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_lumina_checkins_user_data
  ON lumina_checkins(user_id, data);
CREATE INDEX IF NOT EXISTS idx_lumina_checkins_created
  ON lumina_checkins(created_at DESC);

-- RLS
ALTER TABLE lumina_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own checkins"
  ON lumina_checkins FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own checkins"
  ON lumina_checkins FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));


-- =====================================================
-- 2. TABELA: lumina_leituras (Leituras Geradas)
-- =====================================================
-- Guarda a leitura (texto poético) e o padrão detectado
-- para cada check-in.
-- =====================================================

CREATE TABLE IF NOT EXISTS lumina_leituras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id UUID NOT NULL REFERENCES lumina_checkins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Padrão detectado (23 possíveis)
  -- Críticos: crit_vid | crit_pfm | crit_tba
  -- Máximos: forcaMax | presencaRara
  -- Alertas: esgotamento | dissociacao | passadoComanda | falsaClareza |
  --          fugaFrente | menteSabota | corpoGrita | futuroRouba
  -- Protecção: recolhimento
  -- Fertilidade: vazioFertil | silencioCura
  -- Alinhamento: alinhamento | aberturaSemDirecao | corpoLidera
  -- Convite: futuroConvite
  -- Neutros: neutralidade | transicao
  -- Indefinido: diaSemNome
  -- Áurea: aurea_corpoTenso | aurea_energiaBaixa | aurea_espelhoInvisivel | aurea_isolado
  padrao TEXT NOT NULL,

  -- Texto da leitura apresentada
  texto_leitura TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lumina_leituras_checkin
  ON lumina_leituras(checkin_id);
CREATE INDEX IF NOT EXISTS idx_lumina_leituras_user_id
  ON lumina_leituras(user_id);
CREATE INDEX IF NOT EXISTS idx_lumina_leituras_padrao
  ON lumina_leituras(padrao);

-- RLS
ALTER TABLE lumina_leituras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own leituras"
  ON lumina_leituras FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own leituras"
  ON lumina_leituras FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));


-- =====================================================
-- 3. TABELA: lumina_padroes (Catálogo de Padrões)
-- =====================================================
-- Catálogo dos 23 padrões de diagnóstico Lumina.
-- Permite editar textos de leituras via DB sem alterar código.
-- Sincroniza com LEITURAS em lumina-leituras.js.
-- =====================================================

CREATE TABLE IF NOT EXISTS lumina_padroes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificador único do padrão (chave no código)
  codigo TEXT NOT NULL UNIQUE,

  -- Categoria do padrão
  -- critico | maximo | alerta | proteccao | fertilidade |
  -- alinhamento | convite | neutro | indefinido | aurea
  categoria TEXT NOT NULL,

  -- Nome legível
  nome TEXT NOT NULL,

  -- Descrição do padrão (para coach dashboard)
  descricao TEXT,

  -- Nível de severidade (1-5)
  severidade INTEGER DEFAULT 3 CHECK (severidade >= 1 AND severidade <= 5),

  -- Eco recomendado para este padrão
  eco_recomendado TEXT,

  -- Textos de leitura (array de variantes)
  textos_leitura TEXT[] NOT NULL DEFAULT '{}',

  -- Activo (para desactivar padrões sem eliminar)
  activo BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lumina_padroes_codigo
  ON lumina_padroes(codigo);
CREATE INDEX IF NOT EXISTS idx_lumina_padroes_categoria
  ON lumina_padroes(categoria);

-- RLS - Leitura pública (catálogo), escrita só admin
ALTER TABLE lumina_padroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read padroes"
  ON lumina_padroes FOR SELECT
  USING (true);


-- =====================================================
-- 4. TABELA: waitlist (Captura de Emails)
-- =====================================================
-- Captura emails de visitantes não autenticados.
-- Usado pelo Lumina e outras landing pages.
-- =====================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  nome TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT,

  -- Produto/origem do registo
  -- lumina-checkin | vitalis-landing | aurea-landing | bundle-landing
  produto TEXT DEFAULT 'lumina-checkin',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para evitar duplicados (email + produto)
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_produto
  ON waitlist(email, produto);

-- RLS - Inserção livre (visitantes), leitura só admin
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert to waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);


-- =====================================================
-- 5. COLUNAS LUMINA NA TABELA users
-- =====================================================
-- A tabela users já existe (criada pelo AuthContext).
-- Estas colunas são necessárias para o Lumina funcionar.
-- =====================================================

-- Género do utilizador (F=Feminino, M=Masculino, O=Outro)
ALTER TABLE users ADD COLUMN IF NOT EXISTS genero TEXT;

-- Ciclo menstrual - tracking activo
ALTER TABLE users ADD COLUMN IF NOT EXISTS ciclo_activo BOOLEAN DEFAULT FALSE;

-- Último período menstrual (data de início)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ultimo_periodo DATE;

-- Duração do ciclo menstrual (21-35 dias)
ALTER TABLE users ADD COLUMN IF NOT EXISTS duracao_ciclo INTEGER DEFAULT 28;
