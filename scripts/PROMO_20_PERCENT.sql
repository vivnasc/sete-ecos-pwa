-- SQL para criar código promo de 20% de desconto
-- Execute este código na consola SQL do Supabase

INSERT INTO vitalis_invite_codes (
  code,
  type,
  max_uses,
  uses_count,
  notes,
  active,
  expires_at,
  created_at
) VALUES (
  'VEMVITALIS20',           -- Código promocional
  'promo',                  -- Tipo: promo
  500,                       -- Máximo 500 usos
  0,                        -- Usos iniciais: 0
  '20',                     -- Desconto: 20%
  true,                     -- Ativo: sim
  CURRENT_TIMESTAMP + INTERVAL '90 days',  -- Expira em 90 dias
  CURRENT_TIMESTAMP         -- Criado agora
)
ON CONFLICT (code) DO UPDATE SET
  max_uses = 500,
  notes = '20',
  active = true,
  expires_at = CURRENT_TIMESTAMP + INTERVAL '90 days';

-- Verificar se foi criado
SELECT code, type, notes as discount_percent, max_uses, uses_count, active, expires_at
FROM vitalis_invite_codes
WHERE code = 'VEMVITALIS20';
