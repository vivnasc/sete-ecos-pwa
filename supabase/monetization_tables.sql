-- =====================================================
-- SETE ECOS - Tabelas de Monetizacao
-- Executar no Supabase SQL Editor
-- =====================================================

-- 1. REFERRAL CODES - Codigos de referral das utilizadoras
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 10,
  total_uses INTEGER NOT NULL DEFAULT 0,
  successful_conversions INTEGER NOT NULL DEFAULT 0,
  bonus_days_earned INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_codes_active_user ON referral_codes(user_id) WHERE active = true;

-- 2. REFERRAL USES - Registos de uso dos codigos
CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES users(id),
  referred_user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'trial_started' CHECK (status IN ('trial_started', 'converted', 'expired')),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_referral_uses_code_id ON referral_uses(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_referrer ON referral_uses(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_referred ON referral_uses(referred_user_id);
-- Cada utilizadora so pode ser referida uma vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_uses_unique_referred ON referral_uses(referred_user_id);

-- 3. RLS (Row Level Security) - Seguranca
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

-- Utilizadoras podem ver e criar os seus proprios codigos
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own referral codes"
  ON referral_codes FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Qualquer utilizadora pode ler codigos (para validar codigos de outras)
CREATE POLICY "Anyone can read referral codes for validation"
  ON referral_codes FOR SELECT
  USING (true);

-- Referral uses: utilizadoras podem ver os seus proprios usos
CREATE POLICY "Users can view referral uses as referrer"
  ON referral_uses FOR SELECT
  USING (referrer_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view referral uses as referred"
  ON referral_uses FOR SELECT
  USING (referred_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Inserir referral uses (quando alguem usa um codigo)
CREATE POLICY "Users can insert referral uses"
  ON referral_uses FOR INSERT
  WITH CHECK (referred_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Update referral uses (para marcar como converted)
CREATE POLICY "System can update referral uses"
  ON referral_uses FOR UPDATE
  USING (true);

-- Update referral codes counters
CREATE POLICY "System can update referral code counters"
  ON referral_codes FOR UPDATE
  USING (true);

-- 4. GARANTIR que vitalis_clients suporta trial
-- (Ja deve existir, mas garantir que subscription_status aceita 'trial')
-- Se a tabela ja existir com constraints, este ALTER nao faz nada
DO $$
BEGIN
  -- Verificar se a coluna trial_started existe, se nao, adicionar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vitalis_clients' AND column_name = 'trial_started'
  ) THEN
    ALTER TABLE vitalis_clients ADD COLUMN trial_started TIMESTAMPTZ;
  END IF;

  -- Garantir que subscription_updated existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vitalis_clients' AND column_name = 'subscription_updated'
  ) THEN
    ALTER TABLE vitalis_clients ADD COLUMN subscription_updated TIMESTAMPTZ;
  END IF;
END $$;

-- 5. VERIFICACAO FINAL
SELECT 'referral_codes' AS tabela, count(*) AS registos FROM referral_codes
UNION ALL
SELECT 'referral_uses', count(*) FROM referral_uses;
