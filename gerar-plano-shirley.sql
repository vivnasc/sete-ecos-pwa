-- ========================================
-- GERAR PLANO PARA SHIRLEY
-- Email: ntbshirley@gmail.com
-- Altura: 161cm (CORRIGIDO de 1)
-- Peso: 74kg
-- ========================================

-- 1. Buscar user_id (SUBSTITUA ESTE VALOR DEPOIS!)
SELECT id, nome, email FROM users WHERE email = 'ntbshirley@gmail.com';
-- Resultado esperado: copiar o "id" daqui

-- 2. Buscar intake existente (confirmar dados)
SELECT * FROM vitalis_intake WHERE email = 'ntbshirley@gmail.com';

-- ========================================
-- EXECUTAR APÓS COPIAR O user_id:
-- ========================================

-- 3. Desativar planos antigos
UPDATE vitalis_meal_plans
SET status = 'inactivo'
WHERE user_id = 'COLAR_USER_ID_AQUI'
  AND status = 'activo';

-- 4. Criar/Atualizar vitalis_clients
INSERT INTO vitalis_clients (
  user_id,
  status,
  data_inicio,
  fase_actual,
  objectivo_principal,
  peso_inicial,
  peso_actual,
  peso_meta,
  imc_inicial,
  imc_actual,
  emocao_dominante,
  prontidao_1a10
)
VALUES (
  'COLAR_USER_ID_AQUI',
  'activo',
  CURRENT_DATE,
  'inducao',
  'perder_peso',
  74.0,
  74.0,
  68.0,
  ROUND((74.0 / POWER(1.61, 2))::numeric, 1), -- IMC: 28.5
  ROUND((74.0 / POWER(1.61, 2))::numeric, 1),
  'ansiedade', -- Ajustar se souber
  8            -- Ajustar se souber
)
ON CONFLICT (user_id) DO UPDATE
SET
  status = EXCLUDED.status,
  data_inicio = EXCLUDED.data_inicio,
  fase_actual = EXCLUDED.fase_actual,
  peso_actual = EXCLUDED.peso_actual,
  imc_actual = EXCLUDED.imc_actual;

-- 5. Criar novo plano alimentar
-- Cálculos (baseados em código):
-- TMB (Mifflin-St Jeor feminino): (10 * 74) + (6.25 * 161) - (5 * idade) - 161
-- Assumindo idade ~30: (740) + (1006.25) - (150) - 161 = 1435.25
-- TDEE (sedentária): 1435 * 1.2 = 1722
-- Déficit 25%: 1722 * 0.75 = 1291 → arredondado para 1300 (mínimo 1200)

INSERT INTO vitalis_meal_plans (
  user_id,
  versao,
  fase,
  abordagem,
  calorias_alvo,
  proteina_g,
  carboidratos_g,
  gordura_g,
  status,
  receitas_incluidas
)
VALUES (
  'COLAR_USER_ID_AQUI',
  1,
  'inducao',
  'equilibrado', -- Ajustar se souber a preferência
  1300,          -- Calorias (déficit calculado)
  98,            -- Proteína: (1300 * 0.30) / 4 = 97.5 ≈ 98g
  130,           -- Carboidratos: (1300 * 0.40) / 4 = 130g
  43,            -- Gordura: (1300 * 0.30) / 9 = 43.3 ≈ 43g
  'activo',
  '{"porções_por_refeicao": {"proteina": 2, "legumes": 2, "hidratos": 2, "gordura": 2}, "num_refeicoes": 3, "horarios": ["08:00", "13:00", "19:00"]}'::jsonb
)
RETURNING id, calorias_alvo, proteina_g, carboidratos_g, gordura_g;

-- 6. Criar hábitos da fase indução
INSERT INTO vitalis_habitos (user_id, habito, categoria, fase, dias_total, data_inicio)
VALUES
  ('COLAR_USER_ID_AQUI', 'Beber 2L de água por dia', 'hidratacao', 'inducao', 14, CURRENT_DATE),
  ('COLAR_USER_ID_AQUI', 'Fazer 3 refeições dentro da janela alimentar', 'nutricao', 'inducao', 14, CURRENT_DATE),
  ('COLAR_USER_ID_AQUI', 'Dormir 7-8 horas por noite', 'sono', 'inducao', 14, CURRENT_DATE),
  ('COLAR_USER_ID_AQUI', 'Check-in diário na app', 'mindset', 'inducao', 14, CURRENT_DATE);

-- ========================================
-- VERIFICAÇÃO FINAL:
-- ========================================

SELECT
  vmp.id as plano_id,
  vmp.fase,
  vmp.calorias_alvo,
  vmp.proteina_g,
  vmp.carboidratos_g,
  vmp.gordura_g,
  vmp.status,
  vmp.created_at
FROM vitalis_meal_plans vmp
JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
WHERE vi.email = 'ntbshirley@gmail.com'
ORDER BY vmp.created_at DESC
LIMIT 1;
