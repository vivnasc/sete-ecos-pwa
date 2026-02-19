-- =====================================================
-- SETE ECOS - Tabela de Log de Broadcast WhatsApp
-- Executar no Supabase SQL Editor
-- =====================================================

-- Log de todas as mensagens enviadas via broadcast WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_broadcast_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  telefone TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'individual',
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro')),
  erro TEXT,
  message_id TEXT,
  grupo TEXT
);

-- Indices para consultas rapidas
CREATE INDEX IF NOT EXISTS idx_wa_broadcast_telefone ON whatsapp_broadcast_log(telefone);
CREATE INDEX IF NOT EXISTS idx_wa_broadcast_created ON whatsapp_broadcast_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_broadcast_tipo ON whatsapp_broadcast_log(tipo);
CREATE INDEX IF NOT EXISTS idx_wa_broadcast_status ON whatsapp_broadcast_log(status);

-- RLS: apenas service role pode inserir/ler (usado pelo backend)
ALTER TABLE whatsapp_broadcast_log ENABLE ROW LEVEL SECURITY;

-- Policy: service role tem acesso total
CREATE POLICY "Service role full access on whatsapp_broadcast_log"
  ON whatsapp_broadcast_log
  FOR ALL
  USING (true)
  WITH CHECK (true);
