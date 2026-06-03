-- Migration: Individualização Vitalis (10 Pontos)
-- Aplica colunas/tabelas em falta sem destruir dados.
-- Execute no Supabase SQL Editor — todos os comandos são idempotentes.

-- ── PONTO 1: Fase hormonal ──
ALTER TABLE vitalis_intake
  ADD COLUMN IF NOT EXISTS fase_hormonal TEXT;
-- Valores: 'ciclo_regular', 'perimenopausa', 'menopausa', 'pos_menopausa', 'nao_dizer'

-- ── PONTO 2: Janela de jejum específica ──
ALTER TABLE vitalis_intake
  ADD COLUMN IF NOT EXISTS janela_jejum_inicio TIME,
  ADD COLUMN IF NOT EXISTS janela_jejum_fim TIME;

-- ── PONTO 7: Vitórias além da balança no check-in ──
ALTER TABLE vitalis_registos
  ADD COLUMN IF NOT EXISTS vitorias_nao_balanca TEXT[];
-- Valores: roupa_folgada, mais_energia, sono_melhor, fome_controlada,
--         pele_melhor, clareza_mental, disposicao_estavel

-- ── PONTO 6: Medidas expandidas (coxa e braço) ──
ALTER TABLE vitalis_medidas_log
  ADD COLUMN IF NOT EXISTS coxa_cm NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS braco_cm NUMERIC(5,1);

-- ── PONTO 3: Sintomas de adaptação ──
CREATE TABLE IF NOT EXISTS vitalis_sintomas_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  sintoma TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('normais', 'atencao', 'parar')),
  intensidade INTEGER CHECK (intensidade BETWEEN 1 AND 5),
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data, sintoma)
);

CREATE INDEX IF NOT EXISTS idx_sintomas_user_data ON vitalis_sintomas_log(user_id, data DESC);

ALTER TABLE vitalis_sintomas_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own symptoms" ON vitalis_sintomas_log;
CREATE POLICY "Users own symptoms" ON vitalis_sintomas_log
  FOR ALL
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
