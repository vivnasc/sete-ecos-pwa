-- ========================================
-- CORRIGIR vitalis_plano: TABELA → VIEW
-- ========================================
-- CONTEXTO:
-- - vitalis_plano é uma TABELA VAZIA (0 registros)
-- - Precisa ser VIEW para mostrar dados automaticamente
-- - 5 planos reais estão SEGUROS em vitalis_meal_plans
-- ========================================

-- 1. APAGAR tabela VAZIA (100% SEGURO)
DROP TABLE IF EXISTS vitalis_plano CASCADE;

-- 2. CRIAR VIEW com estrutura COMPLETA (49 colunas)
CREATE VIEW vitalis_plano AS
SELECT
  vmp.id,
  vc.id as client_id,
  vmp.created_at,
  CURRENT_TIMESTAMP as updated_at,
  vc.peso_inicial,
  vi.altura_cm,
  vi.idade,
  vi.sexo,
  vi.nivel_actividade,
  vc.peso_meta,
  -- TMB (Mifflin-St Jeor)
  CASE
    WHEN vi.sexo = 'masculino' THEN
      (10 * vc.peso_actual) + (6.25 * vi.altura_cm) - (5 * vi.idade) + 5
    ELSE
      (10 * vc.peso_actual) + (6.25 * vi.altura_cm) - (5 * vi.idade) - 161
  END as tmb,
  1.2 as factor_actividade,
  -- TDEE
  CASE
    WHEN vi.sexo = 'masculino' THEN
      ((10 * vc.peso_actual) + (6.25 * vi.altura_cm) - (5 * vi.idade) + 5) * 1.2
    ELSE
      ((10 * vc.peso_actual) + (6.25 * vi.altura_cm) - (5 * vi.idade) - 161) * 1.2
  END as tdee,
  vmp.fase,
  vc.data_inicio as data_inicio_fase,
  EXTRACT(week FROM AGE(CURRENT_DATE, vc.data_inicio))::integer as semana_na_fase,
  25 as defice_percentual,
  vmp.calorias_alvo as calorias_diarias,
  vmp.proteina_g,
  vmp.carboidratos_g,
  vmp.gordura_g,
  ROUND((vmp.proteina_g * 4.0 * 100.0 / NULLIF(vmp.calorias_alvo, 0))::numeric)::integer as proteina_pct,
  ROUND((vmp.carboidratos_g * 4.0 * 100.0 / NULLIF(vmp.calorias_alvo, 0))::numeric)::integer as carboidratos_pct,
  ROUND((vmp.gordura_g * 9.0 * 100.0 / NULLIF(vmp.calorias_alvo, 0))::numeric)::integer as gordura_pct,
  ROUND((vmp.proteina_g / 25.0)::numeric, 1) as porcoes_proteina,
  4 as porcoes_legumes,
  ROUND((vmp.carboidratos_g / 30.0)::numeric, 1) as porcoes_hidratos,
  ROUND((vmp.gordura_g / 10.0)::numeric, 1) as porcoes_gordura,
  120 as tamanho_palma_g,
  80 as tamanho_punho_g,
  30 as tamanho_mao_g,
  15 as tamanho_polegar_g,
  ARRAY[]::text[] as dias_treino,
  0 as carbs_extra_treino,
  true as refeicao_livre_permitida,
  1 as refeicoes_livres_semana,
  COALESCE(vi.restricoes_alimentares, ARRAY[]::text[]) as restricoes_alimentares,
  COALESCE(vi.alimentos_evitar, ARRAY[]::text[]) as alimentos_evitar,
  '{}'::jsonb as regras_fase,
  vc.peso_actual,
  CURRENT_DATE as ultima_pesagem,
  vmp.abordagem,
  COALESCE(vi.aceita_jejum, false) as aceita_jejum,
  CASE
    WHEN COALESCE(vi.aceita_jejum, false) THEN 'intermitente'
    ELSE NULL
  END as protocolo_jejum,
  NULL::time as janela_alimentar_inicio,
  NULL::time as janela_alimentar_fim,
  CASE
    WHEN COALESCE(vi.aceita_jejum, false) THEN 16
    ELSE NULL
  END as horas_jejum,
  NULL::timestamp as pdf_gerado_em,
  NULL::text as pdf_fase,
  NULL::text as pdf_url
FROM vitalis_meal_plans vmp
LEFT JOIN vitalis_clients vc ON vc.user_id = vmp.user_id
LEFT JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
WHERE vmp.status = 'activo';

-- ========================================
-- 3. VERIFICAR SE FUNCIONOU
-- ========================================

-- A. Contar registos na VIEW (deve mostrar 5 planos)
SELECT COUNT(*) as total_planos_na_view FROM vitalis_plano;

-- B. Ver primeiros 5 registos
SELECT
  id,
  client_id,
  fase,
  calorias_diarias,
  proteina_g,
  carboidratos_g,
  gordura_g
FROM vitalis_plano
LIMIT 5;

-- C. Verificar dados da Nazirta
SELECT
  vp.id,
  vp.fase,
  vp.calorias_diarias,
  vp.proteina_g,
  vi.nome,
  vi.email
FROM vitalis_plano vp
JOIN vitalis_intake vi ON vi.user_id = (
  SELECT user_id FROM vitalis_meal_plans WHERE id = vp.id
)
WHERE vi.email = 'nazirasaide@gmail.com';

-- ========================================
-- 4. PRÓXIMOS PASSOS
-- ========================================

-- Após executar este script COM SUCESSO:
-- 1. Testar PDF da Nazirta no navegador:
--    https://app.seteecos.com/vitalis/plano-pdf?id=08071c48-235b-4033-aaef-8e6e65c8f053
--
-- 2. Se funcionar: Ctrl+P → Guardar como PDF ✅
--
-- 3. Se falhar: Copiar erro do console (F12) e investigar
