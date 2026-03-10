-- Tabela de log de emails enviados (para deduplicação em tarefas-agendadas.js)
-- Sem esta tabela, os emails duplicam porque a verificação de dedup falha silenciosamente.
-- Executar no Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS vitalis_email_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  destinatario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_user_tipo ON vitalis_email_log(user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON vitalis_email_log(created_at);

ALTER TABLE vitalis_email_log ENABLE ROW LEVEL SECURITY;

-- Permitir acesso via service role (usado pelos crons)
CREATE POLICY "email_log_service_all" ON vitalis_email_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
