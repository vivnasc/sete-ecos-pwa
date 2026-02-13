-- ═══════════════════════════════════════════════════════════════
-- 🔍 VERIFICAR DADOS INVÁLIDOS - Prevenir Overflow Numérico
-- ═══════════════════════════════════════════════════════════════
-- EXECUTAR NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
-- ═══════════════════════════════════════════════════════════════

-- 🚨 1. BUSCAR ALTURAS SUSPEITAS (< 100cm ou > 250cm)
SELECT
  vi.user_id,
  vi.nome,
  vi.altura_cm,
  vi.peso_actual,
  vi.created_at,
  '⚠️ Altura inválida' AS problema
FROM vitalis_intake vi
WHERE vi.altura_cm < 100 OR vi.altura_cm > 250
ORDER BY vi.altura_cm ASC;

-- 🚨 2. BUSCAR PESOS SUSPEITOS (< 20kg ou > 300kg)
SELECT
  vi.user_id,
  vi.nome,
  vi.altura_cm,
  vi.peso_actual,
  vi.peso_meta,
  vi.created_at,
  '⚠️ Peso inválido' AS problema
FROM vitalis_intake vi
WHERE vi.peso_actual < 20 OR vi.peso_actual > 300
   OR vi.peso_meta < 20 OR vi.peso_meta > 300
ORDER BY vi.peso_actual ASC;

-- 🧮 3. CALCULAR IMC POTENCIAL (identificar overflows antes de acontecerem)
SELECT
  vi.user_id,
  vi.nome,
  vi.altura_cm,
  vi.peso_actual,
  ROUND(
    vi.peso_actual / POWER((vi.altura_cm / 100.0), 2),
    1
  ) AS imc_calculado,
  CASE
    WHEN vi.altura_cm < 100 THEN '🚨 Altura muito baixa (< 1m)'
    WHEN vi.altura_cm > 250 THEN '🚨 Altura muito alta (> 2.5m)'
    WHEN vi.peso_actual < 20 THEN '🚨 Peso muito baixo (< 20kg)'
    WHEN vi.peso_actual > 300 THEN '🚨 Peso muito alto (> 300kg)'
    WHEN ROUND(vi.peso_actual / POWER((vi.altura_cm / 100.0), 2), 1) > 100 THEN '⚠️ IMC > 100 (provável erro)'
    WHEN ROUND(vi.peso_actual / POWER((vi.altura_cm / 100.0), 2), 1) < 10 THEN '⚠️ IMC < 10 (provável erro)'
    ELSE '✅ OK'
  END AS status,
  vi.created_at
FROM vitalis_intake vi
WHERE
  vi.altura_cm < 100 OR vi.altura_cm > 250
  OR vi.peso_actual < 20 OR vi.peso_actual > 300
  OR ROUND(vi.peso_actual / POWER((vi.altura_cm / 100.0), 2), 1) > 100
  OR ROUND(vi.peso_actual / POWER((vi.altura_cm / 100.0), 2), 1) < 10
ORDER BY imc_calculado DESC;

-- ═══════════════════════════════════════════════════════════════
-- ✅ 4. CORRIGIR DADOS (EXEMPLO - ADAPTAR PARA CADA CASO)
-- ═══════════════════════════════════════════════════════════════
/*
-- EXEMPLO: Corrigir altura de 1cm para 165cm
UPDATE vitalis_intake
SET altura_cm = 165
WHERE user_id = 'USER_ID_AQUI' AND altura_cm = 1;

-- EXEMPLO: Corrigir peso de 0.5kg para 65kg
UPDATE vitalis_intake
SET peso_actual = 65, peso_meta = 60
WHERE user_id = 'USER_ID_AQUI' AND peso_actual < 20;
*/

-- ═══════════════════════════════════════════════════════════════
-- 📊 5. VERIFICAR CAMPOS IMC NA TABELA vitalis_clients
-- ═══════════════════════════════════════════════════════════════
SELECT
  vc.user_id,
  vc.peso_inicial,
  vc.peso_actual,
  vc.imc_inicial,
  vc.imc_actual,
  CASE
    WHEN vc.imc_inicial > 100 THEN '🚨 IMC inicial overflow'
    WHEN vc.imc_actual > 100 THEN '🚨 IMC actual overflow'
    WHEN vc.imc_inicial < 10 THEN '⚠️ IMC inicial muito baixo'
    WHEN vc.imc_actual < 10 THEN '⚠️ IMC actual muito baixo'
    ELSE '✅ OK'
  END AS status
FROM vitalis_clients vc
WHERE
  vc.imc_inicial > 100 OR vc.imc_inicial < 10
  OR vc.imc_actual > 100 OR vc.imc_actual < 10
ORDER BY vc.imc_inicial DESC NULLS LAST;

-- ═══════════════════════════════════════════════════════════════
-- 📝 NOTAS:
-- ═══════════════════════════════════════════════════════════════
-- Ranges esperados:
--   - Altura: 100cm - 250cm (1m - 2.5m)
--   - Peso: 20kg - 300kg
--   - IMC: 10 - 60 (normal), até 100 (máximo aceitável antes de overflow)
--
-- Se campo IMC for NUMERIC(5,2):
--   - Máximo: 999.99
--   - Valores > 999.99 causam "numeric field overflow"
--
-- Solução implementada:
--   1. Validação no frontend (VitalisIntakeComplete.jsx)
--   2. Validação defensiva na API (gerar-plano-manual.js)
--   3. IMC retorna NULL se dados fora dos ranges
-- ═══════════════════════════════════════════════════════════════
