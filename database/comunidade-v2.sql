-- ============================================================
-- SETE ECOS — Comunidade V2: Espaço de Autoconhecimento
-- Executar no Supabase SQL Editor APÓS comunidade-social.sql (V1)
-- ============================================================

-- ============================================================
-- 1. ALTERAR TABELAS EXISTENTES (V1)
-- ============================================================

-- Adicionar colunas ao community_profiles
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS jornada_inicio TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS luz_recebida INTEGER DEFAULT 0;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS reflexoes_count INTEGER DEFAULT 0;

-- Adicionar colunas ao community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS prompt_id TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS saves_count INTEGER DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS ressonancia_count INTEGER DEFAULT 0;

-- Expandir constraint de tipo (remover a antiga e adicionar nova)
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_tipo_check;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_tipo_check
  CHECK (tipo IN (
    'progresso', 'celebracao', 'desafio', 'dica', 'pergunta',
    'gratidao', 'descoberta', 'intencao', 'transformacao',
    'conexao', 'corpo', 'valor', 'visao', 'emocao', 'vontade', 'livre'
  ));

-- Tornar conteudo opcional (para posts só com imagem)
ALTER TABLE community_posts ALTER COLUMN conteudo DROP NOT NULL;

-- ============================================================
-- 2. NOVAS TABELAS
-- ============================================================

-- Círculos de Eco (pequenos grupos de apoio, 7-12 mulheres)
CREATE TABLE IF NOT EXISTS community_circulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eco TEXT NOT NULL CHECK (eco IN ('vitalis', 'aurea', 'lumina', 'serena', 'ignis', 'ventis', 'ecoa')),
  nome TEXT NOT NULL CHECK (char_length(nome) <= 60),
  descricao TEXT DEFAULT '' CHECK (char_length(descricao) <= 200),
  intencao TEXT DEFAULT '' CHECK (char_length(intencao) <= 200),
  max_membros INTEGER DEFAULT 12 CHECK (max_membros BETWEEN 3 AND 15),
  criadora_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros dos Círculos
CREATE TABLE IF NOT EXISTS community_circulo_membros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circulo_id UUID NOT NULL REFERENCES community_circulos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'membro' CHECK (role IN ('guardia', 'membro')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circulo_id, user_id)
);

-- Fogueira (espaço efémero comunal — dura 24h)
CREATE TABLE IF NOT EXISTS community_fogueira (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tema TEXT NOT NULL CHECK (char_length(tema) <= 100),
  prompt TEXT NOT NULL CHECK (char_length(prompt) <= 300),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chamas da Fogueira (contribuições)
CREATE TABLE IF NOT EXISTS community_fogueira_chamas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fogueira_id UUID NOT NULL REFERENCES community_fogueira(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL CHECK (char_length(conteudo) <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversas (Sussurros)
CREATE TABLE IF NOT EXISTS community_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Mensagens (dentro de Sussurros)
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES community_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL CHECK (char_length(conteudo) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações
CREATE TABLE IF NOT EXISTS community_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ressonancia', 'espelho', 'sussurro', 'circulo', 'fogueira', 'seguir')),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  conteudo TEXT DEFAULT '',
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_circulos_eco ON community_circulos(eco);
CREATE INDEX IF NOT EXISTS idx_circulo_membros_circulo ON community_circulo_membros(circulo_id);
CREATE INDEX IF NOT EXISTS idx_circulo_membros_user ON community_circulo_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_fogueira_expires ON community_fogueira(expires_at);
CREATE INDEX IF NOT EXISTS idx_fogueira_chamas_fogueira ON community_fogueira_chamas(fogueira_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON community_conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON community_conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON community_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON community_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON community_notifications(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_posts_prompt ON community_posts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_posts_anonymous ON community_posts(is_anonymous);

-- ============================================================
-- 4. FUNÇÕES RPC ADICIONAIS
-- ============================================================

CREATE OR REPLACE FUNCTION increment_ressonancia(post_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET ressonancia_count = ressonancia_count + 1
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_ressonancia(post_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET ressonancia_count = GREATEST(ressonancia_count - 1, 0)
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_reflexoes_perfil(user_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_profiles
  SET reflexoes_count = reflexoes_count + 1
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_luz_recebida(user_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_profiles
  SET luz_recebida = luz_recebida + 1
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- Círculos
ALTER TABLE community_circulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circulos visiveis a todos os autenticados"
  ON community_circulos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode criar circulos"
  ON community_circulos FOR INSERT
  TO authenticated
  WITH CHECK (criadora_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Criadora pode apagar circulo"
  ON community_circulos FOR DELETE
  TO authenticated
  USING (criadora_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Membros dos Círculos
ALTER TABLE community_circulo_membros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros visiveis a todos os autenticados"
  ON community_circulo_membros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode entrar em circulos"
  ON community_circulo_membros FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Utilizador pode sair de circulos"
  ON community_circulo_membros FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Fogueira
ALTER TABLE community_fogueira ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fogueira visivel a todos os autenticados"
  ON community_fogueira FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Qualquer autenticado pode criar fogueira"
  ON community_fogueira FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Chamas da Fogueira
ALTER TABLE community_fogueira_chamas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chamas visiveis a todos os autenticados"
  ON community_fogueira_chamas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode adicionar chamas"
  ON community_fogueira_chamas FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Conversas (Sussurros)
ALTER TABLE community_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizador ve as proprias conversas"
  ON community_conversations FOR SELECT
  TO authenticated
  USING (
    user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Utilizador pode criar conversas"
  ON community_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Mensagens
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizador ve mensagens das suas conversas"
  ON community_messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM community_conversations
      WHERE user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
         OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Utilizador pode enviar mensagens"
  ON community_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Notificações
ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizador ve as proprias notificacoes"
  ON community_notifications FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Sistema pode criar notificacoes"
  ON community_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utilizador pode atualizar proprias notificacoes"
  ON community_notifications FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
