-- ============================================================
-- MESSENGER — Canal directo Vivianne <> Clientes
-- Suporte a ambas plataformas: Sete Ecos + Os Sete Véus
-- ============================================================

-- Conversas entre utilizadores e Vivianne
CREATE TABLE IF NOT EXISTS messenger_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  canal TEXT NOT NULL DEFAULT 'pessoal' CHECK (canal IN ('pessoal', 'chatbot')),
  origem TEXT NOT NULL DEFAULT 'sete_ecos' CHECK (origem IN ('sete_ecos', 'sete_veus')),
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'arquivada', 'bloqueada')),
  assunto TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_sender_type TEXT CHECK (last_sender_type IN ('user', 'coach', 'bot')),
  unread_user INTEGER NOT NULL DEFAULT 0,
  unread_coach INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Apenas uma conversa activa por utilizador por canal
CREATE UNIQUE INDEX IF NOT EXISTS idx_messenger_conv_user_canal
  ON messenger_conversations(user_id, canal)
  WHERE status = 'activa';

CREATE INDEX IF NOT EXISTS idx_messenger_conv_user ON messenger_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messenger_conv_updated ON messenger_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messenger_conv_unread_coach ON messenger_conversations(unread_coach) WHERE unread_coach > 0;

-- Mensagens individuais
CREATE TABLE IF NOT EXISTS messenger_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES messenger_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'coach', 'bot')),
  sender_id UUID REFERENCES users(id),
  conteudo TEXT,
  tipo TEXT NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagem', 'audio', 'ficheiro', 'sistema')),
  media_url TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messenger_msg_conv ON messenger_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messenger_msg_unread ON messenger_messages(conversation_id, lida) WHERE lida = false;

-- Trigger para actualizar updated_at nas conversas
CREATE OR REPLACE FUNCTION update_messenger_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_messenger_conv_updated ON messenger_conversations;
CREATE TRIGGER trg_messenger_conv_updated
  BEFORE UPDATE ON messenger_conversations
  FOR EACH ROW EXECUTE FUNCTION update_messenger_conversation_timestamp();

-- RLS — utilizadores veem apenas as suas conversas
ALTER TABLE messenger_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conversations"
  ON messenger_conversations FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

CREATE POLICY "Users create own conversations"
  ON messenger_conversations FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

CREATE POLICY "Users update own conversations"
  ON messenger_conversations FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

-- RLS — mensagens: utilizadores veem mensagens das suas conversas
ALTER TABLE messenger_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see messages in own conversations"
  ON messenger_messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM messenger_conversations WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  ));

CREATE POLICY "Users send messages in own conversations"
  ON messenger_messages FOR INSERT
  WITH CHECK (
    sender_type = 'user'
    AND sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    AND conversation_id IN (
      SELECT id FROM messenger_conversations WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- Enable realtime for messenger tables
ALTER PUBLICATION supabase_realtime ADD TABLE messenger_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE messenger_conversations;
