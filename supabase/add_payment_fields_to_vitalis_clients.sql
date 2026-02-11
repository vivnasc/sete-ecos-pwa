-- =====================================================
-- MIGRATION: Adicionar campos de pagamento manual
-- Tabela: vitalis_clients
-- Data: 2025-02-11
-- Autor: Claude Code
-- =====================================================

-- Adicionar colunas para pagamentos manuais (M-Pesa, Transferência, WhatsApp)
-- Estas colunas são necessárias para registerPendingPayment() funcionar

DO $$
BEGIN
  -- 1. payment_method: Método de pagamento usado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vitalis_clients' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE vitalis_clients
    ADD COLUMN payment_method TEXT DEFAULT NULL;

    RAISE NOTICE '✅ Coluna payment_method adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna payment_method já existe (skip)';
  END IF;

  -- 2. payment_reference: Referência/ID do pagamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vitalis_clients' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE vitalis_clients
    ADD COLUMN payment_reference TEXT DEFAULT NULL;

    RAISE NOTICE '✅ Coluna payment_reference adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna payment_reference já existe (skip)';
  END IF;

  -- 3. payment_amount: Valor pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vitalis_clients' AND column_name = 'payment_amount'
  ) THEN
    ALTER TABLE vitalis_clients
    ADD COLUMN payment_amount DECIMAL(10,2) DEFAULT NULL;

    RAISE NOTICE '✅ Coluna payment_amount adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna payment_amount já existe (skip)';
  END IF;

  -- 4. payment_currency: Moeda do pagamento (MZN, USD, EUR)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vitalis_clients' AND column_name = 'payment_currency'
  ) THEN
    ALTER TABLE vitalis_clients
    ADD COLUMN payment_currency TEXT DEFAULT 'MZN';

    RAISE NOTICE '✅ Coluna payment_currency adicionada';
  ELSE
    RAISE NOTICE '⚠️ Coluna payment_currency já existe (skip)';
  END IF;

END $$;

-- =====================================================
-- VERIFICAÇÃO: Listar todas as colunas da tabela
-- =====================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vitalis_clients'
ORDER BY ordinal_position;

-- =====================================================
-- TESTE: Verificar se um UPSERT com os novos campos funciona
-- =====================================================
-- COMENTAR esta secção se já tiveres dados reais!
-- Este é apenas um teste para garantir que a migration funcionou

/*
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Criar user temporário para teste
  INSERT INTO users (auth_id, email, nome)
  VALUES (gen_random_uuid(), 'test@migration.com', 'Test User')
  RETURNING id INTO test_user_id;

  -- Testar UPSERT com os novos campos
  INSERT INTO vitalis_clients (
    user_id,
    status,
    subscription_status,
    payment_method,
    payment_reference,
    payment_amount,
    payment_currency
  ) VALUES (
    test_user_id,
    'activo',
    'pending',
    'M-Pesa',
    'TEST-REF-001',
    12500.00,
    'MZN'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    payment_method = EXCLUDED.payment_method,
    payment_reference = EXCLUDED.payment_reference,
    payment_amount = EXCLUDED.payment_amount,
    payment_currency = EXCLUDED.payment_currency;

  RAISE NOTICE '✅ TESTE PASSOU: UPSERT com novos campos funcionou!';

  -- Limpar teste
  DELETE FROM vitalis_clients WHERE user_id = test_user_id;
  DELETE FROM users WHERE id = test_user_id;

  RAISE NOTICE '✅ Dados de teste removidos';
END $$;
*/
