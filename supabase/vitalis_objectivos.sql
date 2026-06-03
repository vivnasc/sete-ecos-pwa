-- Vitalis · objectivos personalizáveis
-- Cliente define os seus próprios alvos (peso, proteína, treinos/semana,
-- água diária, ou custom). Acompanha progresso individual.
--
-- Correr este SQL no editor Supabase do projecto sete-ecos.

CREATE TABLE IF NOT EXISTS vitalis_objectivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Identidade do objectivo
  tipo TEXT NOT NULL CHECK (tipo IN (
    'peso', 'cintura', 'sono', 'proteina', 'agua',
    'treinos_semana', 'jejum_dias', 'alcool', 'custom'
  )),
  titulo TEXT NOT NULL CHECK (length(titulo) BETWEEN 2 AND 80),
  descricao TEXT CHECK (descricao IS NULL OR length(descricao) <= 280),

  -- Métricas
  valor_inicial NUMERIC,
  valor_actual NUMERIC,
  valor_alvo NUMERIC NOT NULL,
  unidade TEXT CHECK (unidade IS NULL OR length(unidade) <= 20),

  -- Prazo
  prazo_dias INTEGER CHECK (prazo_dias IS NULL OR prazo_dias > 0),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_alvo DATE,

  -- Estado
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'pausado', 'concluido', 'abandonado')),
  data_conclusao TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitalis_objectivos_user_status
  ON vitalis_objectivos(user_id, status);

-- RLS — utilizadora só vê e mexe nos seus objectivos
ALTER TABLE vitalis_objectivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "objectivos_self_select" ON vitalis_objectivos
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "objectivos_self_insert" ON vitalis_objectivos
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "objectivos_self_update" ON vitalis_objectivos
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "objectivos_self_delete" ON vitalis_objectivos
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Coach pode ver tudo (service role já bypassa RLS)
-- Trigger updated_at
CREATE OR REPLACE FUNCTION vitalis_objectivos_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vitalis_objectivos_updated_at ON vitalis_objectivos;
CREATE TRIGGER trg_vitalis_objectivos_updated_at
  BEFORE UPDATE ON vitalis_objectivos
  FOR EACH ROW EXECUTE FUNCTION vitalis_objectivos_touch_updated_at();
