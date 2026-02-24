-- ============================================================
-- SETE ECOS — Comunidade V3: Conexões Mútuas
-- Substituir sistema de "seguir" unilateral por conexões mútuas
-- Executar no Supabase SQL Editor APÓS comunidade-v2.sql
-- ============================================================

-- 1. Adicionar coluna status à tabela community_follows
-- 'pending' = pedido enviado, aguarda aceitação
-- 'accepted' = conexão mútua estabelecida
ALTER TABLE community_follows ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'accepted'
  CHECK (status IN ('pending', 'accepted'));

-- 2. Índice para filtrar por status
CREATE INDEX IF NOT EXISTS idx_community_follows_status ON community_follows(status);

-- 3. Actualizar RLS para permitir UPDATE (aceitar/recusar pedidos)
CREATE POLICY IF NOT EXISTS "Utilizador pode actualizar pedidos recebidos"
  ON community_follows FOR UPDATE
  TO authenticated
  USING (following_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
