-- Push subscriptions para notificações web push
-- Executar no Supabase SQL Editor antes de usar push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar subscriptions por email (coach)
CREATE INDEX IF NOT EXISTS idx_push_subs_email ON push_subscriptions(user_email);

-- RLS: disable para acesso via service role key
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
