-- Script para investigar o problema da Nazira
-- Verificar dados do intake e subscri

ção

-- 1. Buscar user Nazira
SELECT
  u.id as user_id,
  u.nome,
  u.email,
  u.created_at
FROM users u
WHERE u.nome ILIKE '%nazira%'
ORDER BY u.created_at DESC
LIMIT 5;

-- 2. Verificar intake dela
SELECT
  vi.id,
  vi.user_id,
  vi.nome,
  vi.altura_cm,
  vi.peso_actual,
  vi.created_at,
  vi.updated_at
FROM vitalis_intake vi
JOIN users u ON u.id = vi.user_id
WHERE u.nome ILIKE '%nazira%'
ORDER BY vi.created_at DESC
LIMIT 5;

-- 3. Verificar subscription status
SELECT
  vc.id,
  vc.user_id,
  vc.subscription_status,
  vc.status,
  vc.peso_actual,
  vc.created_at
FROM vitalis_clients vc
JOIN users u ON u.id = vc.user_id
WHERE u.nome ILIKE '%nazira%'
ORDER BY vc.created_at DESC
LIMIT 5;

-- 4. Verificar se tem plano gerado
SELECT
  vp.id,
  vp.user_id,
  vp.status,
  vp.created_at
FROM vitalis_meal_plans vp
JOIN users u ON u.id = vp.user_id
WHERE u.nome ILIKE '%nazira%'
ORDER BY vp.created_at DESC
LIMIT 5;

-- 5. Verificar pagamentos
SELECT
  vps.id,
  vps.user_id,
  vps.amount_mzn,
  vps.currency,
  vps.payment_method,
  vps.payment_reference,
  vps.status,
  vps.created_at
FROM vitalis_payment_submissions vps
JOIN users u ON u.id = vps.user_id
WHERE u.nome ILIKE '%nazira%'
ORDER BY vps.created_at DESC
LIMIT 5;
