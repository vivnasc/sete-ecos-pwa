-- ============================================================
-- SCRIPT DE MIGRAÇÃO: Corrigir registos existentes em vitalis_clients
-- ============================================================
-- Este script corrige registos que ficaram incompletos devido às
-- mudanças no commit b8f7b33 que removeu campos essenciais.
--
-- EXECUÇÃO: Copiar e colar no SQL Editor do Supabase
-- ============================================================

-- 1. CORRIGIR vitalis_clients preenchendo campos faltantes
UPDATE vitalis_clients vc
SET
  -- Campos básicos (se NULL, preencher com defaults)
  status = COALESCE(vc.status, 'activo'),
  pacote = COALESCE(vc.pacote, 'essencial'),
  data_inicio = COALESCE(vc.data_inicio, CURRENT_DATE),
  fase_actual = COALESCE(vc.fase_actual, 'inducao'),

  -- Duracao programa (buscar do intake se disponível)
  duracao_programa = COALESCE(
    vc.duracao_programa,
    (
      SELECT CASE vi.prazo
        WHEN '3m' THEN '3_meses'
        WHEN '6m' THEN '6_meses'
        WHEN '9m' THEN '9_meses'
        WHEN '12m' THEN '12_meses'
        ELSE '6_meses'
      END
      FROM vitalis_intakes vi
      WHERE vi.user_id = vc.user_id
      ORDER BY vi.completed_at DESC
      LIMIT 1
    ),
    '6_meses'
  ),

  -- Objectivo (buscar do intake)
  objectivo_principal = COALESCE(
    vc.objectivo_principal,
    (
      SELECT vi.objectivo_principal
      FROM vitalis_intakes vi
      WHERE vi.user_id = vc.user_id
      ORDER BY vi.completed_at DESC
      LIMIT 1
    )
  ),

  -- Peso inicial (se NULL, usar peso_actual)
  peso_inicial = COALESCE(vc.peso_inicial, vc.peso_actual),

  -- Peso meta (buscar do intake)
  peso_meta = COALESCE(
    vc.peso_meta,
    (
      SELECT vi.peso_meta
      FROM vitalis_intakes vi
      WHERE vi.user_id = vc.user_id
      ORDER BY vi.completed_at DESC
      LIMIT 1
    ),
    vc.peso_actual - 10 -- Default: -10kg
  ),

  -- IMC inicial
  imc_inicial = COALESCE(
    vc.imc_inicial,
    ROUND((vc.peso_inicial / ((
      SELECT vi.altura_cm
      FROM vitalis_intakes vi
      WHERE vi.user_id = vc.user_id
      LIMIT 1
    )::float / 100) ^ 2))::numeric, 1)
  ),

  -- IMC actual
  imc_actual = COALESCE(
    vc.imc_actual,
    ROUND((vc.peso_actual / ((
      SELECT vi.altura_cm
      FROM vitalis_intakes vi
      WHERE vi.user_id = vc.user_id
      LIMIT 1
    )::float / 100) ^ 2))::numeric, 1)
  ),

  -- Emoção dominante (buscar do intake)
  emocao_dominante = COALESCE(
    vc.emocao_dominante,
    (
      SELECT vi.emocao_dominante
      FROM vitalis_intakes vi
      WHERE vi.user_id = vc.user_id
      ORDER BY vi.completed_at DESC
      LIMIT 1
    )
  ),

  -- Prontidão (buscar do intake)
  prontidao_1a10 = COALESCE(
    vc.prontidao_1a10,
    (
      SELECT vi.prontidao_1a10::integer
      FROM vitalis_intakes vi
      WHERE vi.user_id = vc.user_id
      ORDER BY vi.completed_at DESC
      LIMIT 1
    ),
    5 -- Default
  )

WHERE
  -- Aplicar apenas a registos que têm pelo menos um intake completo
  EXISTS (
    SELECT 1
    FROM vitalis_intakes vi
    WHERE vi.user_id = vc.user_id
    AND vi.completed_at IS NOT NULL
  )
  AND (
    -- Pelo menos um destes campos está NULL ou vazio
    vc.status IS NULL OR
    vc.pacote IS NULL OR
    vc.data_inicio IS NULL OR
    vc.duracao_programa IS NULL OR
    vc.objectivo_principal IS NULL OR
    vc.peso_meta IS NULL OR
    vc.emocao_dominante IS NULL OR
    vc.prontidao_1a10 IS NULL
  );

-- 2. Mostrar quantos registos foram corrigidos
SELECT
  COUNT(*) as registos_corrigidos,
  'Registos em vitalis_clients corrigidos com sucesso!' as mensagem
FROM vitalis_clients
WHERE status IS NOT NULL
  AND pacote IS NOT NULL
  AND data_inicio IS NOT NULL;

-- 3. Verificar se há planos ativos
SELECT
  vc.user_id,
  u.email,
  vc.status as client_status,
  COUNT(vmp.id) as num_planos_activos
FROM vitalis_clients vc
JOIN users u ON u.id = vc.user_id
LEFT JOIN vitalis_meal_plans vmp ON vmp.user_id = vc.user_id AND vmp.status = 'activo'
WHERE vc.status = 'activo'
GROUP BY vc.user_id, u.email, vc.status
ORDER BY num_planos_activos DESC, u.email;

-- ============================================================
-- INSTRUÇÕES:
-- ============================================================
-- 1. Vai ao Supabase Dashboard
-- 2. SQL Editor
-- 3. Copia e cola este script completo
-- 4. Clica "Run"
-- 5. Verifica os resultados
-- 6. Testa aceder ao /vitalis/dashboard e clicar em "Plano"
-- ============================================================
