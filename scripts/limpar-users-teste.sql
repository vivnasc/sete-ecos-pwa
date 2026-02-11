-- ============================================================
-- Script SIMPLIFICADO para limpar dados de teste do Vitalis
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================

-- Users para limpar:
-- 1. vivianne.saraiva@bancomoc.mz (trial)
-- 2. vivianne-nascimento@outlook.com (tester)

-- ============================================================
-- PASSO 1: Apagar vivianne.saraiva@bancomoc.mz
-- ============================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM users
    WHERE email = 'vivianne.saraiva@bancomoc.mz';

    IF v_user_id IS NOT NULL THEN
        RAISE NOTICE 'Limpando dados de: vivianne.saraiva@bancomoc.mz (ID: %)', v_user_id;

        -- Apagar APENAS tabelas core que sabemos que existem
        DELETE FROM vitalis_meal_plans WHERE user_id = v_user_id;
        DELETE FROM vitalis_intake WHERE user_id = v_user_id;
        DELETE FROM vitalis_checkins WHERE user_id = v_user_id;
        DELETE FROM vitalis_clients WHERE user_id = v_user_id;

        RAISE NOTICE '✅ Limpeza completa!';
    ELSE
        RAISE NOTICE '⚠️ User não encontrado';
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

        -- Apagar APENAS tabelas core que sabemos que existem
        DELETE FROM vitalis_meal_plans WHERE user_id = v_user_id;
        DELETE FROM vitalis_intake WHERE user_id = v_user_id;
        DELETE FROM vitalis_checkins WHERE user_id = v_user_id;
        DELETE FROM vitalis_clients WHERE user_id = v_user_id;

        RAISE NOTICE '✅ Limpeza completa!';
    ELSE
        RAISE NOTICE '⚠️ User não encontrado';
    END IF;
END $$;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

SELECT
    u.email,
    u.nome,
    vc.subscription_status,
    COUNT(mp.id) as num_planos
FROM users u
LEFT JOIN vitalis_clients vc ON vc.user_id = u.id
LEFT JOIN vitalis_meal_plans mp ON mp.user_id = u.id
WHERE u.email IN (
    'vivianne.saraiva@bancomoc.mz',
    'vivianne-nascimento@outlook.com'
)
GROUP BY u.email, u.nome, vc.subscription_status;

-- ============================================================
-- RESULTADO ESPERADO:
-- subscription_status = NULL e num_planos = 0 → LIMPO! ✅
-- ============================================================
