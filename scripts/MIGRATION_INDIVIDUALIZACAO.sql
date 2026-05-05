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
