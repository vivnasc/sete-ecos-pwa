# 🛠️ CORRIGIR OVERFLOW DE IMC - Guia de Resolução

## 📋 **PROBLEMA IDENTIFICADO**

Clientes (Nazira, Shirley) não conseguem baixar PDF do plano porque:

### **ERRO:** `"numeric field overflow"`

**CAUSA RAIZ:**
- Dados inválidos no intake (altura = 1cm em vez de 162cm)
- Cálculo de IMC resulta em valores enormes (600,000)
- PostgreSQL rejeita valores > 999.99 se campo for `NUMERIC(5,2)`

---

## ✅ **SOLUÇÕES IMPLEMENTADAS (Commit `93d3a7a`)**

### 1. **Validação Defensiva na API**
   - Arquivo: `api/gerar-plano-manual.js`
   - `calcularIMC()` retorna `null` para dados inválidos
   - Previne overflow em futuros cálculos

### 2. **Validação no Frontend**
   - Arquivo: `src/components/vitalis/VitalisIntakeComplete.jsx`
   - Valida ranges ANTES de submeter
   - Altura: 100-250cm | Peso: 20-300kg

### 3. **Validação nos Inputs HTML**
   - Atributos `min`/`max` nos campos do formulário
   - Melhor UX (navegador valida automaticamente)

---

## 🔧 **PASSOS PARA CORRIGIR CLIENTES EXISTENTES**

### **PASSO 1: Identificar Clientes Afetadas**

```sql
-- Executar no Supabase SQL Editor
-- https://supabase.com/dashboard/project/vvvdtogvlutrybultffx/editor

-- Ver script completo em: scripts/VERIFICAR-DADOS-INVALIDOS.sql

SELECT
  vi.user_id,
  vi.nome,
  vi.altura_cm,
  vi.peso_actual,
  ROUND(
    vi.peso_actual / POWER((vi.altura_cm / 100.0), 2),
    1
  ) AS imc_calculado
FROM vitalis_intake vi
WHERE
  vi.altura_cm < 100 OR vi.altura_cm > 250
  OR vi.peso_actual < 20 OR vi.peso_actual > 300
ORDER BY vi.altura_cm ASC;
```

---

### **PASSO 2: Corrigir Dados Inválidos**

#### **NAZIRA** (já tem script pronto)

```sql
-- Executar: CORRIGIR-NAZIRA-SQL.sql
UPDATE vitalis_intake
SET altura_cm = 162
WHERE user_id = '77442ec3-7905-4faf-b719-00faae084b3b';
```

#### **SHIRLEY (ou outras clientes)**

```sql
-- ADAPTAR valores corretos para cada cliente
UPDATE vitalis_intake
SET altura_cm = [ALTURA_CORRETA_EM_CM],
    peso_actual = [PESO_CORRETO_SE_NECESSARIO],
    peso_meta = [PESO_META_CORRETO_SE_NECESSARIO]
WHERE user_id = '[USER_ID_DA_CLIENTE]';
```

**⚠️ IMPORTANTE:** Contacta a cliente para confirmar os valores corretos!

---

### **PASSO 3: Verificar Correção**

```sql
SELECT
  nome,
  altura_cm,
  peso_actual,
  peso_meta,
  ROUND(peso_actual / POWER((altura_cm / 100.0), 2), 1) AS imc
FROM vitalis_intake
WHERE user_id = '[USER_ID_DA_CLIENTE]';
```

**IMC esperado:** Entre 15 e 50 (valores normais)

---

### **PASSO 4: Regenerar Plano**

Escolhe **UMA** das opções:

#### **OPÇÃO A: Via Coach Dashboard (RECOMENDADO)**
1. Ir para `/vitalis/coach`
2. Procurar cliente (ex: "Nazira")
3. Clicar **"Gerar Plano"**
4. Sistema cria plano com dados corrigidos

#### **OPÇÃO B: Pedir à Cliente para Fazer Logout/Login**
1. Cliente faz logout da app
2. Faz login novamente
3. Sistema detecta intake completo
4. Gera plano automático

#### **OPÇÃO C: Via API Manual (para admins)**
```bash
# NAZIRA
https://sete-ecos-pwa.vercel.app/api/gerar-plano-manual?secret=vivnasc2026&user_id=77442ec3-7905-4faf-b719-00faae084b3b

# SHIRLEY (substituir USER_ID)
https://sete-ecos-pwa.vercel.app/api/gerar-plano-manual?secret=vivnasc2026&user_id=[SHIRLEY_USER_ID]
```

---

## 📊 **VERIFICAR SUCESSO**

### 1. **Confirmar IMC Correto no Banco**

```sql
SELECT
  vc.user_id,
  vc.peso_actual,
  vc.imc_inicial,
  vc.imc_actual,
  CASE
    WHEN vc.imc_inicial > 100 THEN '🚨 AINDA COM PROBLEMA'
    WHEN vc.imc_inicial < 10 THEN '🚨 AINDA COM PROBLEMA'
    ELSE '✅ CORRIGIDO'
  END AS status
FROM vitalis_clients vc
WHERE user_id IN (
  '77442ec3-7905-4faf-b719-00faae084b3b', -- Nazira
  '[SHIRLEY_USER_ID]'
);
```

### 2. **Testar Download de PDF**

1. Cliente faz login
2. Vai para Dashboard Vitalis
3. Clica **"Baixar Plano"**
4. PDF deve gerar sem erros

---

## 🎯 **RESUMO RÁPIDO**

| Passo | Ação | Onde |
|-------|------|------|
| 1 | Identificar clientes com dados inválidos | SQL (VERIFICAR-DADOS-INVALIDOS.sql) |
| 2 | Corrigir altura/peso no intake | SQL (UPDATE vitalis_intake) |
| 3 | Verificar IMC calculado | SQL (SELECT com cálculo) |
| 4 | Regenerar plano | Coach Dashboard OU API manual |
| 5 | Testar download PDF | App (como cliente) |

---

## 🚀 **PREVENÇÃO FUTURA**

### **✅ Já Implementado:**
- Validação no frontend (min/max nos inputs)
- Validação no backend (ranges na API)
- Validação defensiva (IMC retorna NULL se inválido)

### **📌 Novos Intakes:**
- Sistema automaticamente rejeita dados fora dos ranges
- Cliente vê mensagem clara de erro
- Não permite submissão até corrigir

---

## 📞 **CONTACTAR CLIENTES AFETADAS**

### **Template de Mensagem:**

```
Olá [NOME]! 👋

Detectámos um pequeno erro nos teus dados de altura no sistema.
Para gerares o teu plano Vitalis corretamente, preciso confirmar:

📏 Altura: [???] cm
⚖️ Peso actual: [???] kg
🎯 Peso meta: [???] kg

Podes confirmar estes valores? Assim que confirmares, vou corrigir no sistema e gerar o teu plano personalizado!

Obrigada! 💚
Vivianne
```

---

## 🔗 **ARQUIVOS RELACIONADOS**

- `scripts/VERIFICAR-DADOS-INVALIDOS.sql` - Diagnóstico completo
- `CORRIGIR-NAZIRA-SQL.sql` - Correção específica da Nazira
- `api/gerar-plano-manual.js` - Lógica de validação (linha 10-25)
- `src/components/vitalis/VitalisIntakeComplete.jsx` - Validação frontend (linha 343-370)

---

## ✅ **CHECKLIST DE RESOLUÇÃO**

- [ ] Executar `VERIFICAR-DADOS-INVALIDOS.sql` no Supabase
- [ ] Identificar todas as clientes com dados inválidos
- [ ] Contactar clientes para confirmar valores corretos
- [ ] Corrigir dados no banco (UPDATE vitalis_intake)
- [ ] Verificar IMC calculado (deve estar entre 15-50)
- [ ] Regenerar plano via Coach Dashboard
- [ ] Testar download de PDF como cliente
- [ ] Confirmar com cliente que consegue baixar PDF

---

**Commit:** `93d3a7a`
**Sessão:** https://claude.ai/code/session_013UyJUScyeMEVrmXGoPBXMg
**Data:** 2026-02-13
