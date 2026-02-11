-- ============================================================
-- Script para limpar dados de teste do Vitalis
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================

-- Users para limpar:
-- 1. vivianne.saraiva@bancomoc.mz (trial)
-- 2. vivianne-nascimento@outlook.com (tester)

-- ============================================================
-- PASSO 1: Apagar vivianne.saraiva@bancomoc.mz
-- ============================================================

-- Encontrar user_id
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM users
    WHERE email = 'vivianne.saraiva@bancomoc.mz';

    IF v_user_id IS NOT NULL THEN
        RAISE NOTICE 'Limpando dados de: vivianne.saraiva@bancomoc.mz (ID: %)', v_user_id;

        -- Apagar dados relacionados (ordem: filhos primeiro, pais depois)
        DELETE FROM vitalis_meal_plans WHERE user_id = v_user_id;
        DELETE FROM vitalis_habitos WHERE user_id = v_user_id;
        DELETE FROM vitalis_intake WHERE user_id = v_user_id;
        DELETE FROM vitalis_checkins WHERE user_id = v_user_id;
        DELETE FROM vitalis_alerts WHERE user_id = v_user_id;
        DELETE FROM vitalis_pdfs_gerados WHERE user_id = v_user_id;
        DELETE FROM vitalis_clients WHERE user_id = v_user_id;

        RAISE NOTICE '✅ Limpeza completa para vivianne.saraiva@bancomoc.mz';
    ELSE
        RAISE NOTICE '⚠️ User vivianne.saraiva@bancomoc.mz não encontrado';
    END IF;
END $$;

-- ============================================================
-- PASSO 2: Apagar vivianne-nascimento@outlook.com
-- ============================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM users
    WHERE email = 'vivianne-nascimento@outlook.com';

    IF v_user_id IS NOT NULL THEN
        RAISE NOTICE 'Limpando dados de: vivianne-nascimento@outlook.com (ID: %)', v_user_id;

        -- Apagar dados relacionados (ordem: filhos primeiro, pais depois)
        DELETE FROM vitalis_meal_plans WHERE user_id = v_user_id;
        DELETE FROM vitalis_habitos WHERE user_id = v_user_id;
        DELETE FROM vitalis_intake WHERE user_id = v_user_id;
        DELETE FROM vitalis_checkins WHERE user_id = v_user_id;
        DELETE FROM vitalis_alerts WHERE user_id = v_user_id;
        DELETE FROM vitalis_pdfs_gerados WHERE user_id = v_user_id;
        DELETE FROM vitalis_clients WHERE user_id = v_user_id;

        RAISE NOTICE '✅ Limpeza completa para vivianne-nascimento@outlook.com';
    ELSE
        RAISE NOTICE '⚠️ User vivianne-nascimento@outlook.com não encontrado';
    END IF;
END $$;

-- ============================================================
-- VERIFICAÇÃO: Ver se foram apagados
-- ============================================================

SELECT
    u.email,
    u.nome,
    vc.subscription_status,
    vc.created_at as vitalis_desde
FROM users u
LEFT JOIN vitalis_clients vc ON vc.user_id = u.id
WHERE u.email IN (
    'vivianne.saraiva@bancomoc.mz',
    'vivianne-nascimento@outlook.com'
);

-- ============================================================
-- RESULTADO ESPERADO:
-- Se a limpeza funcionou, as colunas vitalis_* devem estar NULL
-- ============================================================
