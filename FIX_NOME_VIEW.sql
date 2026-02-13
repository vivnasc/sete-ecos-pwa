-- ========================================
-- CORRIGIR VIEW: ADICIONAR nome e email
-- ========================================

-- Recriar VIEW adicionando nome e email
CREATE OR REPLACE VIEW vitalis_plano AS
SELECT
  vmp.id,
  vmp.user_id,  -- ADICIONAR user_id também
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
  NULL::text as pdf_url,
  -- ✅ ADICIONAR ESTAS 2 COLUNAS:
  vi.nome,
  vi.email
FROM vitalis_meal_plans vmp
LEFT JOIN vitalis_clients vc ON vc.user_id = vmp.user_id
LEFT JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
WHERE vmp.status = 'activo';

-- ========================================
-- VERIFICAR SE FUNCIONOU
-- ========================================

-- Ver nome da Nazira
SELECT
  id,
  nome,
  email,
  fase,
  calorias_diarias
FROM vitalis_plano
WHERE id = '08071c48-235b-4033-aaef-8e6e65c8f053';
