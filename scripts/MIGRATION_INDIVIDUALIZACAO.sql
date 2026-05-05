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
