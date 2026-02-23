-- =====================================================================
-- SETE ECOS PWA - Schema Consolidation Migration
-- Safe migration with IF NOT EXISTS and DO $$ blocks
-- Date: 2026-02-23
-- =====================================================================

-- =====================================================================
-- 1. CREATE SHARED TRIGGER FUNCTION (if not exists)
-- =====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 2. CREATE USERS TABLE (formal definition)
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  genero TEXT CHECK (genero IS NULL OR genero IN ('masculino', 'feminino')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth_id = auth.uid());

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 3. ADD SUBSCRIPTION_EXPIRES TO VITALIS_CLIENTS (if missing)
-- =====================================================================
DO $$
BEGIN
  ALTER TABLE vitalis_clients ADD COLUMN subscription_expires TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

-- =====================================================================
-- 4. CREATE VITALIS_ALERTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS vitalis_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN (
    'novo_pagamento', 'novo_cliente', 'trial_expiring',
    'espaco_retorno', 'plano_erro', 'meta_atingida'
  )),
  descricao TEXT NOT NULL,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'lido', 'resolvido')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitalis_alerts_user ON vitalis_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_vitalis_alerts_status ON vitalis_alerts(status);
CREATE INDEX IF NOT EXISTS idx_vitalis_alerts_created ON vitalis_alerts(created_at DESC);

ALTER TABLE vitalis_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vitalis_alerts_select_own" ON vitalis_alerts;
CREATE POLICY "vitalis_alerts_select_own" ON vitalis_alerts
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "vitalis_alerts_insert_own" ON vitalis_alerts;
CREATE POLICY "vitalis_alerts_insert_own" ON vitalis_alerts
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "vitalis_alerts_update_own" ON vitalis_alerts;
CREATE POLICY "vitalis_alerts_update_own" ON vitalis_alerts
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

DROP TRIGGER IF EXISTS update_vitalis_alerts_updated_at ON vitalis_alerts;
CREATE TRIGGER update_vitalis_alerts_updated_at
  BEFORE UPDATE ON vitalis_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 5. CREATE VITALIS_SUBSCRIPTION_LOG TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS vitalis_subscription_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_status TEXT NOT NULL CHECK (new_status IN (
    'tester', 'trial', 'active', 'pending', 'expired', 'cancelled'
  )),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitalis_subscription_log_user ON vitalis_subscription_log(user_id);
CREATE INDEX IF NOT EXISTS idx_vitalis_subscription_log_created ON vitalis_subscription_log(created_at DESC);

ALTER TABLE vitalis_subscription_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vitalis_subscription_log_select_own" ON vitalis_subscription_log;
CREATE POLICY "vitalis_subscription_log_select_own" ON vitalis_subscription_log
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- =====================================================================
-- 6. CREATE VITALIS_INVITE_CODES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS vitalis_invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('tester', 'trial', 'promo')),
  max_uses INTEGER DEFAULT 1 CHECK (max_uses > 0),
  uses_count INTEGER DEFAULT 0 CHECK (uses_count >= 0),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vitalis_invite_codes_code ON vitalis_invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_vitalis_invite_codes_active ON vitalis_invite_codes(active);

-- =====================================================================
-- 7. CREATE VITALIS_INVITE_USES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS vitalis_invite_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES vitalis_invite_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vitalis_invite_uses_code ON vitalis_invite_uses(code_id);
CREATE INDEX IF NOT EXISTS idx_vitalis_invite_uses_user ON vitalis_invite_uses(user_id);

-- =====================================================================
-- 8. CREATE CHATBOT_MENSAGENS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS chatbot_mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefone TEXT NOT NULL,
  nome TEXT,
  mensagem_in TEXT NOT NULL,
  mensagem_out TEXT NOT NULL,
  chave_detectada TEXT,
  notificou_coach BOOLEAN DEFAULT FALSE,
  canal TEXT DEFAULT 'whatsapp',
  sessao_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_telefone ON chatbot_mensagens(telefone);
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_created ON chatbot_mensagens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_sessao ON chatbot_mensagens(sessao_id);

-- =====================================================================
-- 9. UPDATE PUSH_SUBSCRIPTIONS WITH RLS POLICIES
-- =====================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'push_subscriptions') THEN
    ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "push_subs_coach_manage" ON push_subscriptions;
    CREATE POLICY "push_subs_coach_manage" ON push_subscriptions
      FOR ALL
      USING (auth.jwt() ->> 'email' IN (
        'viv.saraiva@gmail.com',
        'vivnasc@gmail.com',
        'vivianne.saraiva@outlook.com'
      ))
      WITH CHECK (auth.jwt() ->> 'email' IN (
        'viv.saraiva@gmail.com',
        'vivnasc@gmail.com',
        'vivianne.saraiva@outlook.com'
      ));
  END IF;
END $$;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Summary:
-- 1. Shared trigger function (update_updated_at_column)
-- 2. users table (formal definition with RLS)
-- 3. subscription_expires column on vitalis_clients
-- 4. vitalis_alerts table
-- 5. vitalis_subscription_log table
-- 6. vitalis_invite_codes table
-- 7. vitalis_invite_uses table
-- 8. chatbot_mensagens table
-- 9. push_subscriptions RLS policies
--
-- All operations are idempotent (safe to re-run).
-- Execute in Supabase SQL Editor.
-- =====================================================================
