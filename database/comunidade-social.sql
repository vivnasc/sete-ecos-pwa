-- ============================================================
-- SETE ECOS — Comunidade (Social Features)
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. Perfis públicos da comunidade
CREATE TABLE IF NOT EXISTS community_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_emoji TEXT DEFAULT '🌸',
  ecos_activos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Posts da comunidade
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('progresso', 'celebracao', 'desafio', 'dica', 'pergunta')),
  eco TEXT CHECK (eco IN ('vitalis', 'aurea', 'lumina', 'serena', 'ignis', 'ventis', 'ecoa')),
  conteudo TEXT NOT NULL CHECK (char_length(conteudo) <= 1000),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Likes nos posts
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 4. Comentários nos posts
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL CHECK (char_length(conteudo) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sistema de follows
CREATE TABLE IF NOT EXISTS community_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================================
-- Índices para performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_eco ON community_posts(eco);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_follower ON community_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_following ON community_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_community_profiles_user_id ON community_profiles(user_id);

-- ============================================================
-- Funções RPC para contadores atómicos
-- ============================================================

CREATE OR REPLACE FUNCTION increment_likes(post_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(post_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_comments(post_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET comments_count = comments_count + 1
  WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Perfis: visíveis a todos, editáveis pelo dono
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis visíveis a todos os autenticados"
  ON community_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode criar/editar o próprio perfil"
  ON community_profiles FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Posts: visíveis a todos, criados/apagados pelo dono
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts visíveis a todos os autenticados"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode criar posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Utilizador pode apagar os próprios posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Sistema pode atualizar contadores de posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (true);

-- Likes
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes visíveis a todos"
  ON community_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode gerir os próprios likes"
  ON community_likes FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Comentários
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários visíveis a todos"
  ON community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode criar comentários"
  ON community_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Utilizador pode apagar os próprios comentários"
  ON community_comments FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Follows
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows visíveis a todos"
  ON community_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizador pode gerir os próprios follows"
  ON community_follows FOR ALL
  TO authenticated
  USING (follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
