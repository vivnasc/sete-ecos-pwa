-- Vitalis · adicionar coluna vitorias_nao_balanca a vitalis_registos
-- O check-in semanal regista até 7 "vitórias não-balança" (roupa folgada,
-- mais energia, sono melhor, fome controlada, pele limpa, clareza mental,
-- disposição estável).

ALTER TABLE vitalis_registos
  ADD COLUMN IF NOT EXISTS vitorias_nao_balanca TEXT[];

COMMENT ON COLUMN vitalis_registos.vitorias_nao_balanca IS
  'Vitórias não-balança seleccionadas no check-in semanal: roupa_folgada, mais_energia, sono_melhor, fome_controlada, pele_melhor, clareza_mental, disposicao_estavel';
