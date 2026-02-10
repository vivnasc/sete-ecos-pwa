-- Tabela para agendar publicações Instagram automaticamente
-- O cron /api/instagram-schedule verifica a cada 15 minutos

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('photo', 'carousel', 'story')),
  image_url TEXT NOT NULL,
  caption TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
  error_message TEXT,
  published_at TIMESTAMPTZ,
  media_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dia_calendario INT,
  tarefa_titulo TEXT
);

-- Index para o cron buscar posts pendentes rapidamente
CREATE INDEX idx_scheduled_posts_pending ON scheduled_posts (status, scheduled_at)
  WHERE status = 'pending';

-- RLS: só coaches podem inserir/ver
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches podem gerir posts agendados"
  ON scheduled_posts
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('viv.saraiva@gmail.com', 'vivnasc@gmail.com')
    )
  );
