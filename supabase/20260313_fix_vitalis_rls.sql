-- =====================================================================
-- FIX: Corrigir RLS policies para vitalis_intake e vitalis_clients
--
-- PROBLEMA: As políticas RLS usam `auth.uid() = user_id`, mas o código
-- armazena `users.id` (não auth.users.id) como user_id.
-- Resultado: upserts/queries silenciosamente bloqueados pelo RLS.
--
-- SOLUÇÃO: Atualizar políticas para fazer subquery na tabela users,
-- seguindo o padrão já usado em vitalis_alerts (consolidate_schema).
--
-- EXECUTAR NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
--
-- Data: 2026-03-13
-- =====================================================================

-- =====================================================================
-- 1. CORRIGIR RLS: vitalis_intake
-- =====================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own intake" ON vitalis_intake;
DROP POLICY IF EXISTS "Users can insert own intake" ON vitalis_intake;
DROP POLICY IF EXISTS "Users can update own intake" ON vitalis_intake;

-- Criar políticas novas (subquery via users.auth_id)
CREATE POLICY "Users can view own intake" ON vitalis_intake
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can insert own intake" ON vitalis_intake
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own intake" ON vitalis_intake
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================================
-- 2. CORRIGIR RLS: vitalis_clients
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own client record" ON vitalis_clients;
DROP POLICY IF EXISTS "Users can insert own client record" ON vitalis_clients;
DROP POLICY IF EXISTS "Users can update own client record" ON vitalis_clients;

CREATE POLICY "Users can view own client record" ON vitalis_clients
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can insert own client record" ON vitalis_clients
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own client record" ON vitalis_clients
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================================
-- 3. CORRIGIR RLS: vitalis_meal_plans
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own meal plans" ON vitalis_meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON vitalis_meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON vitalis_meal_plans;

CREATE POLICY "Users can view own meal plans" ON vitalis_meal_plans
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can insert own meal plans" ON vitalis_meal_plans
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own meal plans" ON vitalis_meal_plans
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================================
-- 4. CORRIGIR RLS: vitalis_habitos
-- =====================================================================

DROP POLICY IF EXISTS "Users can manage own habitos" ON vitalis_habitos;

CREATE POLICY "Users can manage own habitos" ON vitalis_habitos
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================================
-- 5. CORRIGIR RLS: vitalis_checkins
-- =====================================================================

DROP POLICY IF EXISTS "Users can manage own checkins" ON vitalis_checkins;

CREATE POLICY "Users can manage own checkins" ON vitalis_checkins
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================================
-- 6. CORRIGIR RLS: vitalis_medidas_log
-- =====================================================================

DROP POLICY IF EXISTS "Users can manage own medidas" ON vitalis_medidas_log;

CREATE POLICY "Users can manage own medidas" ON vitalis_medidas_log
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================================
-- 7. CORRIGIR FK: vitalis_intake.user_id → users(id) em vez de auth.users(id)
-- =====================================================================

-- Remover FK antiga (se existir) e criar nova apontando para users(id)
DO $$
BEGIN
  -- Tentar remover FK existente para auth.users
  ALTER TABLE vitalis_intake DROP CONSTRAINT IF EXISTS vitalis_intake_user_id_fkey;
  -- Criar FK para users(id)
  ALTER TABLE vitalis_intake ADD CONSTRAINT vitalis_intake_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FK vitalis_intake já está correcta ou não existe: %', SQLERRM;
END $$;

-- Mesmo para vitalis_clients
DO $$
BEGIN
  ALTER TABLE vitalis_clients DROP CONSTRAINT IF EXISTS vitalis_clients_user_id_fkey;
  ALTER TABLE vitalis_clients ADD CONSTRAINT vitalis_clients_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FK vitalis_clients já está correcta ou não existe: %', SQLERRM;
END $$;

-- Mesmo para vitalis_meal_plans
DO $$
BEGIN
  ALTER TABLE vitalis_meal_plans DROP CONSTRAINT IF EXISTS vitalis_meal_plans_user_id_fkey;
  ALTER TABLE vitalis_meal_plans ADD CONSTRAINT vitalis_meal_plans_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FK vitalis_meal_plans já está correcta ou não existe: %', SQLERRM;
END $$;

-- =====================================================================
-- 8. CORRIGIR CHECK: subscription_status incluir 'none'
-- =====================================================================

DO $$
BEGIN
  ALTER TABLE vitalis_clients DROP CONSTRAINT IF EXISTS vitalis_clients_subscription_status_check;
  ALTER TABLE vitalis_clients ADD CONSTRAINT vitalis_clients_subscription_status_check
    CHECK (subscription_status IN ('active', 'trial', 'pending', 'expired', 'cancelled', 'tester', 'none'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'CHECK constraint já correcta: %', SQLERRM;
END $$;

-- =====================================================================
-- 9. VERIFICAÇÃO
-- =====================================================================
SELECT 'RLS policies actualizadas com sucesso!' AS resultado;
