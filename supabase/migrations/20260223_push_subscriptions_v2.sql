-- Push subscriptions + preferences — criar tudo do zero
-- Executar no Supabase SQL Editor

-- 1. Tabela de push subscriptions (browser push endpoints)
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

CREATE INDEX IF NOT EXISTS idx_push_subs_email ON push_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_role ON push_subscriptions(role);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Tabela de preferências de notificação dos clientes
CREATE TABLE IF NOT EXISTS push_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  eco TEXT NOT NULL DEFAULT 'global',
  lembretes JSONB DEFAULT '[]'::jsonb,
  timezone TEXT DEFAULT 'Africa/Maputo',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_prefs_user ON push_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_push_prefs_activo ON push_preferences(activo);

ALTER TABLE push_preferences ENABLE ROW LEVEL SECURITY;
