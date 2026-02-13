# 🚨 URGENTE: CRIAR TABELAS VITALIS NO SUPABASE

---

## ❌ **PROBLEMA CRÍTICO DESCOBERTO**

```
ERROR: 42P01: relation "vitalis_intake" does not exist
```

**AS TABELAS VITALIS NUNCA FORAM CRIADAS NO BANCO DE PRODUÇÃO!**

Isso explica:
- ❌ Nazira não consegue baixar PDF
- ❌ Shirley (tester) dá erro
- ❌ Sistema funciona localmente mas falha em produção

---

## ⚡ **SOLUÇÃO IMEDIATA (5 MINUTOS)**

### **PASSO 1: Ir ao Supabase SQL Editor**

1. Abrir: https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor
2. Login com tua conta
3. Clicar em **"New Query"**

---

### **PASSO 2: Executar o Schema Completo**

1. Abrir o arquivo: **`supabase/vitalis_tables.sql`**
2. **COPIAR TODO O CONTEÚDO** (454 linhas)
3. **COLAR** no SQL Editor do Supabase
4. Clicar em **"Run"** (ou `Ctrl+Enter`)

**⏱️ Tempo estimado:** 10-15 segundos

---

### **PASSO 3: Verificar Sucesso**

No final do script, vai aparecer:

```
✅ TABELA           | REGISTOS
-------------------+----------
vitalis_intake     | 0
vitalis_clients    | 0
vitalis_meal_plans | 0
vitalis_habitos    | 0
vitalis_checkins   | 0
```

**Se aparecer isso = SUCESSO!** 🎉

---

## 📋 **O QUE O SCRIPT FAZ**

### **Cria 5 Tabelas Essenciais:**

1. **`vitalis_intake`** - Questionário de entrada
   - ✅ Validação: altura (100-250cm), peso (20-300kg)
   - ✅ CHECK constraints previnem overflow

2. **`vitalis_clients`** - Clientes activos
   - ✅ IMC com validação (10-100)
   - ✅ Campos de pagamento incluídos

3. **`vitalis_meal_plans`** - Planos alimentares
   - ✅ Calorias, macros, receitas

4. **`vitalis_habitos`** - Hábitos diários
   - ✅ Tracking de progresso

5. **`vitalis_checkins`** - Check-ins diários
   - ✅ Peso, água, energia, humor

### **Configurações de Segurança:**

- ✅ **RLS (Row Level Security)** ativado
- ✅ Cada user só vê os seus próprios dados
- ✅ Políticas de acesso configuradas

### **Validações Automáticas:**

```sql
altura_cm INTEGER CHECK (altura_cm >= 100 AND altura_cm <= 250)
peso_actual NUMERIC(5,1) CHECK (peso_actual >= 20 AND peso_actual <= 300)
imc_inicial NUMERIC(4,1) CHECK (imc_inicial >= 10 AND imc_inicial <= 100)
```

**Isso previne o overflow automáticamente!** 🛡️

---

## 🔄 **DEPOIS DE CRIAR AS TABELAS**

### **OPÇÃO A: Testar com Nova Cliente**

1. Nova user faz signup
2. Preenche intake completo
3. Sistema gera plano automático
4. Consegue baixar PDF ✅

### **OPÇÃO B: Migrar Dados Existentes (se houver)**

Se já tens clientes no sistema com dados noutro formato:

```sql
-- Executar após criar as tabelas
-- Verificar se há dados em outras tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'vitalis%';
```

Se aparecer `vitalis_intakes` (com 's'), precisamos migrar:

```sql
-- Migrar de vitalis_intakes → vitalis_intake
INSERT INTO vitalis_intake
SELECT * FROM vitalis_intakes
ON CONFLICT (user_id) DO NOTHING;
```

---

## ⚠️ **NOTAS IMPORTANTES**

### **1. Dados Existentes**

Se já tens clientes (Nazira, Shirley):
- ✅ Dados vão ser preservados
- ✅ Tabelas criadas com `IF NOT EXISTS`
- ✅ Não apaga nada

### **2. RLS e Auth**

O schema usa `auth.users(id)` que:
- ✅ É o sistema de auth do Supabase
- ✅ Já deve existir no teu projeto
- ✅ Liga automaticamente aos users

### **3. Validações vs Código**

Agora tens **DUPLA PROTEÇÃO**:
- Frontend valida (VitalisIntakeComplete.jsx)
- Backend valida (calcularIMC na API)
- **Banco de dados valida** (CHECK constraints) ← NOVO!

---

## 🧪 **TESTAR APÓS CRIAÇÃO**

### **Teste 1: Inserir Intake Válido**

```sql
INSERT INTO vitalis_intake (
  user_id, nome, email, idade, sexo,
  altura_cm, peso_actual, peso_meta,
  objectivo_principal, abordagem_preferida
) VALUES (
  auth.uid(), -- ID do user atual
  'Teste Validação',
  'teste@exemplo.com',
  30,
  'feminino',
  165, -- ✅ Válido (100-250)
  70,  -- ✅ Válido (20-300)
  60,  -- ✅ Válido (20-300)
  'emagrecer',
  'low_carb'
);
```

### **Teste 2: Tentar Inserir Altura Inválida**

```sql
INSERT INTO vitalis_intake (
  user_id, nome, email, idade, sexo,
  altura_cm, peso_actual, peso_meta,
  objectivo_principal, abordagem_preferida
) VALUES (
  auth.uid(),
  'Teste Erro',
  'erro@exemplo.com',
  30,
  'feminino',
  1, -- ❌ INVÁLIDO (< 100)
  70,
  60,
  'emagrecer',
  'low_carb'
);
```

**DEVE DAR ERRO:**
```
ERROR: new row violates check constraint "vitalis_intake_altura_cm_check"
```

**Isso é BOM! Significa que validação funciona!** ✅

---

## ✅ **CHECKLIST DE EXECUÇÃO**

- [ ] 1. Abrir Supabase SQL Editor
- [ ] 2. Copiar conteúdo de `supabase/vitalis_tables.sql`
- [ ] 3. Colar e executar no SQL Editor
- [ ] 4. Verificar mensagem de sucesso (5 tabelas listadas)
- [ ] 5. Testar insert de intake válido
- [ ] 6. Testar insert de altura inválida (deve dar erro)
- [ ] 7. *(Opcional)* Migrar dados de `vitalis_intakes` se existir
- [ ] 8. Testar signup de nova cliente
- [ ] 9. Verificar geração de plano
- [ ] 10. Testar download de PDF

---

## 🆘 **SE DER ERRO**

### **Erro: "permission denied"**

```sql
-- Executar ANTES do schema principal:
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO postgres, anon, authenticated;
```

### **Erro: "duplicate key value violates unique constraint"**

Já tens dados! Pula para **OPÇÃO B** acima.

### **Erro: "function auth.uid() does not exist"**

Usa o user_id manualmente:

```sql
-- Substituir auth.uid() por:
'USER_ID_AQUI'::uuid
```

---

## 📞 **PRÓXIMOS PASSOS APÓS CRIAR TABELAS**

1. ✅ Tabelas criadas
2. ⏳ Corrigir dados da Nazira/Shirley (CORRIGIR-OVERFLOW-IMC.md)
3. ⏳ Regenerar planos via Coach Dashboard
4. ⏳ Testar download de PDF
5. ⏳ Confirmar com clientes que funciona

---

**ARQUIVO PRINCIPAL:** `supabase/vitalis_tables.sql`
**GUIA DE CORREÇÃO:** `CORRIGIR-OVERFLOW-IMC.md`
**COMMIT:** `19032eb`

---

# 🚀 **EXECUTA AGORA!**

**Sem essas tabelas, NADA funciona!**

Depois de criar, reporta aqui o resultado! 📊
