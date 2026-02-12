-- ═══════════════════════════════════════════════════════════════
-- 🚨 CORREÇÃO URGENTE - NAZIRA
-- ═══════════════════════════════════════════════════════════════
-- EXECUTAR NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
-- ═══════════════════════════════════════════════════════════════

-- 1️⃣ CORRIGIR ALTURA (1cm → 162cm)
UPDATE vitalis_intake
SET altura_cm = 162
WHERE user_id = '77442ec3-7905-4faf-b719-00faae084b3b';

-- 2️⃣ VERIFICAR CORREÇÃO
SELECT
  nome,
  altura_cm,
  peso_actual,
  idade,
  created_at
FROM vitalis_intake
WHERE user_id = '77442ec3-7905-4faf-b719-00faae084b3b';

-- ═══════════════════════════════════════════════════════════════
-- ✅ DEPOIS DE EXECUTAR:
-- ═══════════════════════════════════════════════════════════════
--
-- OPÇÃO A: Gerar plano via Coach Dashboard
--   1. Ir para /vitalis/coach
--   2. Procurar "Nazira"
--   3. Clicar "Gerar Plano"
--
-- OPÇÃO B: Pedir à Nazira para fazer logout/login
--   Sistema vai detectar intake completo e gerar plano automático
--
-- ═══════════════════════════════════════════════════════════════
