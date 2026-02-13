-- ========================================
-- DIAGNÓSTICO COMPLETO NAZIRTA
-- Email: nazirasaide@gmail.com
-- ========================================

-- 1. VER TODOS OS DADOS DO PLANO ATIVO
SELECT
  vmp.id as plano_id,
  vmp.user_id,
  vmp.fase,
  vmp.abordagem,
  vmp.calorias_alvo,
  vmp.proteina_g,
  vmp.carboidratos_g,
  vmp.gordura_g,
  vmp.status,
  vmp.receitas_incluidas,
  vmp.created_at,
  vi.nome,
  vi.email,
  vi.altura_cm,
  vi.peso_actual
FROM vitalis_meal_plans vmp
JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
WHERE vi.email = 'nazirasaide@gmail.com'
  AND vmp.status = 'activo'
ORDER BY vmp.created_at DESC
LIMIT 1;

-- ========================================
-- 2. VERIFICAR SE EXISTE NA VIEW vitalis_plano
-- ========================================
SELECT * FROM vitalis_plano
WHERE id IN (
  SELECT vmp.id
  FROM vitalis_meal_plans vmp
  JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
  WHERE vi.email = 'nazirasaide@gmail.com'
    AND vmp.status = 'activo'
);

-- ========================================
-- 3. VERIFICAR CLIENTE EM vitalis_clients
-- ========================================
SELECT
  vc.*
FROM vitalis_clients vc
JOIN vitalis_intake vi ON vi.user_id = vc.user_id
WHERE vi.email = 'nazirasaide@gmail.com';

-- ========================================
-- 4. VERIFICAR INTAKE
-- ========================================
SELECT * FROM vitalis_intake
WHERE email = 'nazirasaide@gmail.com';

-- ========================================
-- 5. VERIFICAR SE VIEW vitalis_plano EXISTE
-- ========================================
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'vitalis_plano'
) as view_existe;

-- Se NÃO EXISTIR, criar a view:
-- ========================================
-- 6. CRIAR VIEW vitalis_plano (SE NÃO EXISTIR)
-- ========================================
CREATE OR REPLACE VIEW vitalis_plano AS
SELECT
  vmp.id,
  vmp.user_id,
  vmp.versao,
  vmp.fase,
  vmp.abordagem,
  vmp.calorias_alvo as calorias_diarias,
  vmp.proteina_g,
  vmp.carboidratos_g,
  vmp.gordura_g,
  vmp.status,
  vmp.receitas_incluidas,
  vmp.created_at,
  vmp.updated_at,
  vc.id as client_id,
  vc.peso_actual,
  vc.peso_meta,
  vc.objectivo_principal,
  vi.nome,
  vi.email
FROM vitalis_meal_plans vmp
LEFT JOIN vitalis_clients vc ON vc.user_id = vmp.user_id
LEFT JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
WHERE vmp.status = 'activo';

-- ========================================
-- 7. TESTAR SE DADOS APARECEM NA VIEW
-- ========================================
SELECT * FROM vitalis_plano
WHERE email = 'nazirasaide@gmail.com';

-- ========================================
-- 8. SE TUDO ESTIVER CORRETO, TESTAR URL:
-- ========================================
-- Copiar o plano_id da query #1
-- Testar no navegador:
-- https://app.seteecos.com/vitalis/plano-pdf?id=COLAR_PLANO_ID_AQUI

-- Exemplo (com o ID que já vimos):
-- https://app.seteecos.com/vitalis/plano-pdf?id=08071c48-235b-4033-aaef-8e6e65c8f053
