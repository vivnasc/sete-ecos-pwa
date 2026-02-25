-- ============================================================
-- SETE ECOS — Ghost Users para Comunidade
-- Executar no Supabase SQL Editor
-- Cria utilizadores ghost na DB para mensagens persistentes
-- ============================================================

-- 1. Permitir auth_id NULL na tabela users (para ghost users)
ALTER TABLE users ALTER COLUMN auth_id DROP NOT NULL;

-- 2. Adicionar flag is_ghost
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_ghost BOOLEAN DEFAULT FALSE;

-- 3. Adicionar coluna imagem_url a community_messages (para consistencia)
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- 4. Adicionar is_ghost a community_profiles
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS is_ghost BOOLEAN DEFAULT FALSE;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS iniciais TEXT;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS avatar_color JSONB;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS personalidade TEXT;
ALTER TABLE community_profiles ADD COLUMN IF NOT EXISTS membro_desde DATE;

-- 5. Actualizar constraint UNIQUE de users para permitir NULL auth_id
-- (auth_id NULL nao viola UNIQUE por natureza do SQL)

-- 6. Inserir ghost users
-- Usando UUIDs deterministicos para referencia no codigo
INSERT INTO users (id, auth_id, email, nome, is_ghost) VALUES
  ('00000000-0000-4000-a000-000000000001', NULL, 'ghost_graca@seteecos.ghost', 'Graça Mondlane', TRUE),
  ('00000000-0000-4000-a000-000000000002', NULL, 'ghost_esperanca@seteecos.ghost', 'Esperança Nhaca', TRUE),
  ('00000000-0000-4000-a000-000000000003', NULL, 'ghost_celeste@seteecos.ghost', 'Celeste Macuácua', TRUE),
  ('00000000-0000-4000-a000-000000000004', NULL, 'ghost_amina@seteecos.ghost', 'Amina Hassane', TRUE),
  ('00000000-0000-4000-a000-000000000005', NULL, 'ghost_fatima@seteecos.ghost', 'Fátima Sitoe', TRUE),
  ('00000000-0000-4000-a000-000000000006', NULL, 'ghost_halima@seteecos.ghost', 'Halima Januário', TRUE),
  ('00000000-0000-4000-a000-000000000007', NULL, 'ghost_dulce@seteecos.ghost', 'Dulce Cossa', TRUE),
  ('00000000-0000-4000-a000-000000000008', NULL, 'ghost_aisha@seteecos.ghost', 'Aisha Momade', TRUE),
  ('00000000-0000-4000-a000-000000000009', NULL, 'ghost_zainab@seteecos.ghost', 'Zainab Mussá', TRUE),
  ('00000000-0000-4000-a000-000000000010', NULL, 'ghost_mariamo@seteecos.ghost', 'Mariamo Abdala', TRUE),
  ('00000000-0000-4000-a000-000000000011', NULL, 'ghost_joana@seteecos.ghost', 'Joana Tembe', TRUE),
  ('00000000-0000-4000-a000-000000000012', NULL, 'ghost_luisa@seteecos.ghost', 'Luísa Cumbane', TRUE),
  ('00000000-0000-4000-a000-000000000013', NULL, 'ghost_rosa@seteecos.ghost', 'Rosa Mabjaia', TRUE),
  ('00000000-0000-4000-a000-000000000014', NULL, 'ghost_beatriz@seteecos.ghost', 'Beatriz Nhambi', TRUE),
  ('00000000-0000-4000-a000-000000000015', NULL, 'ghost_safira@seteecos.ghost', 'Safira Langa', TRUE),
  ('00000000-0000-4000-a000-000000000016', NULL, 'ghost_nhara@seteecos.ghost', 'Nhara Guambe', TRUE),
  ('00000000-0000-4000-a000-000000000017', NULL, 'ghost_ines@seteecos.ghost', 'Inês Chissano', TRUE),
  ('00000000-0000-4000-a000-000000000018', NULL, 'ghost_marta@seteecos.ghost', 'Marta Chiziane', TRUE),
  ('00000000-0000-4000-a000-000000000019', NULL, 'ghost_ana@seteecos.ghost', 'Ana Macie', TRUE),
  ('00000000-0000-4000-a000-000000000020', NULL, 'ghost_claudia@seteecos.ghost', 'Cláudia Dzucula', TRUE),
  ('00000000-0000-4000-a000-000000000021', NULL, 'ghost_rafael@seteecos.ghost', 'Rafael Tembe', TRUE),
  ('00000000-0000-4000-a000-000000000022', NULL, 'ghost_dinis@seteecos.ghost', 'Dinis Machanguana', TRUE),
  ('00000000-0000-4000-a000-000000000023', NULL, 'ghost_dina@seteecos.ghost', 'Dina Matsombe', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. Inserir community_profiles para ghost users
INSERT INTO community_profiles (user_id, display_name, bio, avatar_emoji, is_ghost, iniciais, avatar_color, cidade, personalidade, membro_desde, ecos_activos) VALUES
  ('00000000-0000-4000-a000-000000000001', 'Graça Mondlane', 'Mãe de três, de Maputo. O Vitalis devolveu-me a energia que achava perdida.', '🌺', TRUE, 'GM', '{"bg":"#D97706","text":"#FFF"}', 'Maputo', 'calorosa', '2025-09-14', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000002', 'Esperança Nhaca', 'Professora em Matola. A ensinar e a aprender todos os dias.', '📚', TRUE, 'EN', '{"bg":"#B45309","text":"#FFF"}', 'Matola', 'reflexiva', '2025-10-02', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000003', 'Celeste Macuácua', 'Enfermeira na Beira. Cuido dos outros, agora aprendo a cuidar de mim.', '🕊️', TRUE, 'CM', '{"bg":"#92400E","text":"#FFF"}', 'Beira', 'empática', '2025-08-20', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000004', 'Amina Hassane', 'De Nampula. O Vitalis ensinou-me a alimentar o corpo com intenção e gratidão.', '🌙', TRUE, 'AH', '{"bg":"#DC2626","text":"#FFF"}', 'Nampula', 'sabia', '2025-07-15', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000005', 'Fátima Sitoe', 'Empreendedora em Maputo. A equilibrar negócio e alma.', '✨', TRUE, 'FS', '{"bg":"#9333EA","text":"#FFF"}', 'Maputo', 'determinada', '2025-06-10', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000006', 'Halima Januário', 'Mãe e comerciante na Ilha de Moçambique. A cuidar de mim para cuidar dos meus.', '🕊️', TRUE, 'HJ', '{"bg":"#059669","text":"#FFF"}', 'Ilha de Moçambique', 'calorosa', '2025-11-05', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000007', 'Dulce Cossa', 'Avó aos 50. Nunca é tarde para recomeçar. Cada dia é uma nova semente.', '🌸', TRUE, 'DC', '{"bg":"#0891B2","text":"#FFF"}', 'Inhambane', 'sabia', '2025-05-22', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000008', 'Aisha Momade', 'Farmacêutica em Maputo. Descobri no Lumina padrões que não via há anos.', '🌟', TRUE, 'AM', '{"bg":"#BE185D","text":"#FFF"}', 'Maputo', 'curiosa', '2025-09-28', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000009', 'Zainab Mussá', 'Professora em Pemba. A transformação começa no prato e no coração.', '💫', TRUE, 'ZM', '{"bg":"#7C3AED","text":"#FFF"}', 'Pemba', 'determinada', '2025-12-01', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000010', 'Mariamo Abdala', 'Nascida em Angoche. O caminho do autoconhecimento não tem pressa.', '🌷', TRUE, 'MA', '{"bg":"#EA580C","text":"#FFF"}', 'Angoche', 'poetica', '2025-10-18', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000011', 'Joana Tembe', 'Depois de uma fase difícil, estou a renascer. Maputo é a minha raiz.', '🌱', TRUE, 'JT', '{"bg":"#0D9488","text":"#FFF"}', 'Maputo', 'vulneravel', '2026-01-08', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000012', 'Luísa Cumbane', 'Artista plástica em Xai-Xai. Encontro nos Ecos cores que não sabia que tinha.', '🎨', TRUE, 'LC', '{"bg":"#4338CA","text":"#FFF"}', 'Xai-Xai', 'criativa', '2025-08-03', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000013', 'Rosa Mabjaia', 'Nutricionista em formação. O Vitalis é o meu laboratório interior.', '🍃', TRUE, 'RM', '{"bg":"#C026D3","text":"#FFF"}', 'Maputo', 'pratica', '2025-07-20', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000014', 'Beatriz Nhambi', 'De Chimoio. O caminho da cura começa por dentro.', '💜', TRUE, 'BN', '{"bg":"#15803D","text":"#FFF"}', 'Chimoio', 'corajosa', '2025-11-12', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000015', 'Safira Langa', 'Estudante de psicologia na UEM. Fascinada pelo autoconhecimento.', '🔮', TRUE, 'SL', '{"bg":"#A16207","text":"#FFF"}', 'Maputo', 'curiosa', '2025-09-05', '{lumina}'),
  ('00000000-0000-4000-a000-000000000016', 'Nhara Guambe', 'Runner e amante de chás. A descobrir o meu ritmo entre Matola e o mar.', '🍵', TRUE, 'NG', '{"bg":"#7E22CE","text":"#FFF"}', 'Matola', 'energetica', '2025-10-30', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000017', 'Inês Chissano', 'Jornalista freelancer. As palavras curam quando são verdadeiras.', '🖊️', TRUE, 'IC', '{"bg":"#DB2777","text":"#FFF"}', 'Maputo', 'articulada', '2025-06-28', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000018', 'Marta Chiziane', 'Yoga e meditação em Vilankulo. Este mar é o meu jardim.', '🧘', TRUE, 'MC', '{"bg":"#0E7490","text":"#FFF"}', 'Vilankulo', 'espiritual', '2025-08-15', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000019', 'Ana Macie', 'Cozinheira de coração. A comida tradicional é a minha meditação.', '🍲', TRUE, 'AM', '{"bg":"#B91C1C","text":"#FFF"}', 'Quelimane', 'pratica', '2025-12-20', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000020', 'Cláudia Dzucula', 'Contabilista que descobriu que os números da alma importam mais.', '📊', TRUE, 'CD', '{"bg":"#6D28D9","text":"#FFF"}', 'Maputo', 'reflexiva', '2025-11-25', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000021', 'Rafael Tembe', 'Personal trainer em Maputo. Descobri que treinar o corpo sem nutrir a mente é só metade do caminho.', '💪', TRUE, 'RT', '{"bg":"#1E40AF","text":"#FFF"}', 'Maputo', 'determinada', '2025-10-10', '{vitalis}'),
  ('00000000-0000-4000-a000-000000000022', 'Dinis Machanguana', 'Engenheiro na Matola. A cuidar da saúde por mim e pelos meus filhos.', '🛠️', TRUE, 'DM', '{"bg":"#065F46","text":"#FFF"}', 'Matola', 'pratica', '2025-12-15', '{vitalis,lumina}'),
  ('00000000-0000-4000-a000-000000000023', 'Dina Matsombe', 'Designer em Maputo. A criar a minha melhor versão.', '🎨', TRUE, 'DT', '{"bg":"#9333EA","text":"#FFF"}', 'Maputo', 'criativa', '2026-01-15', '{vitalis}')
ON CONFLICT (user_id) DO NOTHING;

-- 8. Actualizar RLS para que ghost users sejam visiveis a todos

-- Users: permitir SELECT de ghost users por qualquer autenticado
DROP POLICY IF EXISTS "users_select_ghost" ON users;
CREATE POLICY "users_select_ghost" ON users
  FOR SELECT TO authenticated
  USING (is_ghost = TRUE OR auth_id = auth.uid());

-- Community profiles: ghosts visiveis (ja coberto pela policy existente "Perfis visíveis a todos")

-- Conversas: authenticated users podem ver conversas com ghosts
DROP POLICY IF EXISTS "Utilizador ve as proprias conversas" ON community_conversations;
CREATE POLICY "Utilizador ve as proprias conversas"
  ON community_conversations FOR SELECT TO authenticated
  USING (
    user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR user1_id IN (SELECT id FROM users WHERE is_ghost = TRUE)
    OR user2_id IN (SELECT id FROM users WHERE is_ghost = TRUE)
  );

-- Conversas: permitir criar conversas com ghosts
DROP POLICY IF EXISTS "Utilizador pode criar conversas" ON community_conversations;
CREATE POLICY "Utilizador pode criar conversas"
  ON community_conversations FOR INSERT TO authenticated
  WITH CHECK (
    user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Conversas: permitir update (last_message)
DROP POLICY IF EXISTS "Utilizador pode atualizar conversas" ON community_conversations;
CREATE POLICY "Utilizador pode atualizar conversas"
  ON community_conversations FOR UPDATE TO authenticated
  USING (
    user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Mensagens: ver mensagens de conversas proprias (incluindo com ghosts)
DROP POLICY IF EXISTS "Utilizador ve mensagens das suas conversas" ON community_messages;
CREATE POLICY "Utilizador ve mensagens das suas conversas"
  ON community_messages FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM community_conversations
      WHERE user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
         OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Mensagens: enviar mensagens (user real)
DROP POLICY IF EXISTS "Utilizador pode enviar mensagens" ON community_messages;
CREATE POLICY "Utilizador pode enviar mensagens"
  ON community_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- 9. Funcao RPC para ghost responder (SECURITY DEFINER bypassa RLS)
CREATE OR REPLACE FUNCTION ghost_reply(
  p_conversation_id UUID,
  p_ghost_user_id UUID,
  p_conteudo TEXT
)
RETURNS UUID AS $$
DECLARE
  v_msg_id UUID;
  v_is_ghost BOOLEAN;
BEGIN
  -- Verificar que e realmente um ghost
  SELECT is_ghost INTO v_is_ghost FROM users WHERE id = p_ghost_user_id;
  IF v_is_ghost IS NOT TRUE THEN
    RAISE EXCEPTION 'User is not a ghost';
  END IF;

  -- Inserir mensagem
  INSERT INTO community_messages (conversation_id, sender_id, conteudo)
  VALUES (p_conversation_id, p_ghost_user_id, p_conteudo)
  RETURNING id INTO v_msg_id;

  -- Actualizar last_message da conversa
  UPDATE community_conversations
  SET last_message = p_conteudo, last_message_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_msg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Funcao RPC para criar conversa com ghost (o user real inicia)
CREATE OR REPLACE FUNCTION create_ghost_conversation(
  p_user_id UUID,
  p_ghost_user_id UUID,
  p_initial_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_conv_id UUID;
  v_is_ghost BOOLEAN;
  v_existing UUID;
BEGIN
  -- Verificar que e realmente um ghost
  SELECT is_ghost INTO v_is_ghost FROM users WHERE id = p_ghost_user_id;
  IF v_is_ghost IS NOT TRUE THEN
    RAISE EXCEPTION 'Target user is not a ghost';
  END IF;

  -- Verificar se ja existe conversa
  SELECT id INTO v_existing FROM community_conversations
  WHERE (user1_id = p_ghost_user_id AND user2_id = p_user_id)
     OR (user1_id = p_user_id AND user2_id = p_ghost_user_id)
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  -- Criar conversa (ghost como user1, real como user2)
  INSERT INTO community_conversations (user1_id, user2_id, last_message, last_message_at)
  VALUES (p_ghost_user_id, p_user_id, p_initial_message, NOW())
  RETURNING id INTO v_conv_id;

  -- Inserir mensagem inicial do ghost
  INSERT INTO community_messages (conversation_id, sender_id, conteudo)
  VALUES (v_conv_id, p_ghost_user_id, p_initial_message);

  RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Funcao para obter ghost profiles (para uso no client)
CREATE OR REPLACE FUNCTION get_ghost_profiles()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  bio TEXT,
  avatar_emoji TEXT,
  avatar_color JSONB,
  iniciais TEXT,
  cidade TEXT,
  personalidade TEXT,
  membro_desde DATE,
  ecos_activos TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.user_id,
    cp.display_name,
    cp.bio,
    cp.avatar_emoji,
    cp.avatar_color,
    cp.iniciais,
    cp.cidade,
    cp.personalidade,
    cp.membro_desde,
    cp.ecos_activos
  FROM community_profiles cp
  WHERE cp.is_ghost = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
