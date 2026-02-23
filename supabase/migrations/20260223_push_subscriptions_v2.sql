-- Push subscriptions v2 — suportar clientes + coaches
-- Executar no Supabase SQL Editor

-- Adicionar colunas para user_id e role
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';

-- Index para buscar subscriptions por user_id (clientes)
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_role ON push_subscriptions(role);

-- Tabela para preferências de notificação dos clientes
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
