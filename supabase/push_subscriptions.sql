-- Push subscriptions para notificações web push
-- Executar no Supabase SQL Editor antes de usar push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_id TEXT,
  role TEXT DEFAULT 'client',
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar subscriptions por email (coach push)
CREATE INDEX IF NOT EXISTS idx_push_subs_email ON push_subscriptions(user_email);

-- Index para buscar subscriptions por user_id (client push lembretes)
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);

-- RLS: disable para acesso via service role key
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MIGRAÇÃO: Se a tabela já existe mas faltam colunas
-- Executar ESTE bloco se a tabela já existir:
-- =====================================================
-- ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS user_id TEXT;
-- ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
-- CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);
