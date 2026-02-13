# 🚀 COMANDOS PARA EXECUTAR NO AMBIENTE WEB

> **IMPORTANTE:** Você está no Claude Code Web, então precisa usar:
> - 🌐 **Navegador** para APIs (não cURL)
> - 💾 **Supabase SQL Editor** para queries SQL

---

## 📊 **CONTEXTO:**

### **Shirley Nhantumbo** (ntbshirley@gmail.com)
- ✅ Altura corrigida: 161cm (era 1cm)
- ✅ Peso: 74kg
- ✅ IMC: 28.5 (CORRETO!)
- ❌ **NÃO TEM PLANO** (0 planos)

### **Nazirta** (nazirasaide@gmail.com)
- ✅ Altura: 162cm
- ✅ Peso: 100kg
- ✅ IMC: 38.1 (CORRETO!)
- ✅ **TEM 3 PLANOS** (último: `08071c48-235b-4033-aaef-8e6e65c8f053`)
- ⚠️ **PDF não funciona** (motivo a investigar)

---

## 1️⃣ **GERAR PLANO PARA SHIRLEY**

### **🌐 Via NAVEGADOR (Ambiente Web):**

Abra no navegador:
```
https://app.seteecos.com/api/regenerar-plano-emergencia?email=ntbshirley@gmail.com
```

**OU via gerar-plano-manual:**
```
https://app.seteecos.com/api/gerar-plano-manual?secret=vivnasc2026&email=ntbshirley@gmail.com
```

---

### **Opção B: Via SQL (SUPABASE)**

Abrir **Supabase > SQL Editor** e executar:

```sql
-- 1. Buscar user_id
SELECT id, nome, email FROM users WHERE email = 'ntbshirley@gmail.com';
-- COPIAR O "id" DAQUI!

-- 2. Executar script completo:
-- Ver arquivo: gerar-plano-shirley.sql
-- (SUBSTITUIR 'COLAR_USER_ID_AQUI' pelo ID copiado acima)
```

---

## 2️⃣ **DIAGNOSTICAR E CORRIGIR PDF DA NAZIRTA**

### **🔍 PROBLEMA:**
Nazirta tem 3 planos, mas PDF não funciona. Possível causa: **View `vitalis_plano` não existe ou está vazia**.

---

### **🛠️ PASSO 1: Executar diagnóstico completo**

Ir para **Supabase → SQL Editor** e executar:

```sql
-- Ver arquivo: diagnostico-nazirta-completo.sql
-- (Colar TODO o conteúdo do arquivo e executar)
```

**OU copiar queries individuais:**

#### **A. Ver plano ativo:**
```sql
SELECT
  vmp.id as plano_id,
  vmp.fase,
  vmp.calorias_alvo,
  vmp.status,
  vi.nome,
  vi.email
FROM vitalis_meal_plans vmp
JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
WHERE vi.email = 'nazirasaide@gmail.com'
  AND vmp.status = 'activo';
```

#### **B. Verificar se view existe:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'vitalis_plano'
) as view_existe;
```

---

### **🛠️ PASSO 2: Criar view vitalis_plano (SE NÃO EXISTIR)**

```sql
CREATE OR REPLACE VIEW vitalis_plano AS
SELECT
  vmp.id,
  vmp.user_id,
  vmp.versao,
  vmp.fase,
  vmp.abordagem,
  vmp.calorias_alvo as calorias_diarias,
  vmp.proteina_g,
  vmp.carboidratos_g,
  vmp.gordura_g,
  vmp.status,
  vmp.receitas_incluidas,
  vmp.created_at,
  vmp.updated_at,
  vc.id as client_id,
  vc.peso_actual,
  vc.peso_meta,
  vc.objectivo_principal,
  vi.nome,
  vi.email
FROM vitalis_meal_plans vmp
LEFT JOIN vitalis_clients vc ON vc.user_id = vmp.user_id
LEFT JOIN vitalis_intake vi ON vi.user_id = vmp.user_id
WHERE vmp.status = 'activo';
```

---

### **🛠️ PASSO 3: Testar PDF no navegador**

Abrir URL:
```
https://app.seteecos.com/vitalis/plano-pdf?id=08071c48-235b-4033-aaef-8e6e65c8f053
```

**Se funcionar:** Ctrl+P → Guardar como PDF ✅
**Se falhar:** Copiar erro do console (F12) e investigar

---

## 3️⃣ **VERIFICAR SE SHIRLEY TEM USER_ID**

```sql
-- Verificar se Shirley está na tabela users:
SELECT id, nome, email, auth_id, created_at
FROM users
WHERE email = 'ntbshirley@gmail.com';

-- Se NÃO EXISTIR, criar manualmente:
INSERT INTO users (id, nome, email, auth_id, created_at)
VALUES (
  gen_random_uuid(),
  'Shirley Nhantumbo',
  'ntbshirley@gmail.com',
  'COLAR_AUTH_ID_DO_SUPABASE_AUTH',
  NOW()
)
RETURNING *;
```

---

## 4️⃣ **COMANDOS DE DEBUG**

### **Ver planos de todas:**
```sql
SELECT
  vi.nome,
  vi.email,
  COUNT(vmp.id) as num_planos,
  MAX(vmp.created_at) as ultimo_plano,
  MAX(vmp.id) as ultimo_plano_id
FROM vitalis_intake vi
LEFT JOIN vitalis_meal_plans vmp ON vmp.user_id = vi.user_id
WHERE vi.email IN ('ntbshirley@gmail.com', 'nazirasaide@gmail.com', 'viv.saraiva@gmail.com')
GROUP BY vi.nome, vi.email
ORDER BY vi.nome;
```

### **Ver status de subscription:**
```sql
SELECT
  vi.nome,
  vi.email,
  vc.subscription_status,
  vc.subscription_expires,
  vc.status as vitalis_status
FROM vitalis_intake vi
LEFT JOIN vitalis_clients vc ON vc.user_id = vi.user_id
WHERE vi.email IN ('ntbshirley@gmail.com', 'nazirasaide@gmail.com');
```

---

## 5️⃣ **AÇÕES RECOMENDADAS:**

### **AGORA:**
1. ✅ Executar **Opção A** (API) para gerar plano da Shirley
2. ✅ Testar PDF da Nazirta com comando cURL POST

### **SE API FALHAR:**
1. ⚠️ Executar **Opção B** (SQL) no Supabase
2. ⚠️ Verificar logs no Vercel

### **DEPOIS:**
1. 🎯 Regenerar todos os planos usando `/api/regenerar-plano-emergencia`
2. 🎯 Criar script de health check para validar planos

---

## 📋 **CHECKLIST:**

- [ ] Gerar plano Shirley (API ou SQL)
- [ ] Verificar plano criado (`SELECT * FROM vitalis_meal_plans WHERE user_id = ...`)
- [ ] Testar download PDF Nazirta
- [ ] Verificar se PDF funciona para Shirley após gerar plano
- [ ] Documentar erros (se houver)

---

## 🆘 **SE NADA FUNCIONAR:**

```sql
-- RESET COMPLETO (CUIDADO! APAGA PLANOS ANTIGOS!)
DELETE FROM vitalis_meal_plans WHERE user_id IN (
  SELECT user_id FROM vitalis_intake
  WHERE email IN ('ntbshirley@gmail.com', 'nazirasaide@gmail.com')
);

-- Depois regenerar via API:
-- curl "https://app.seteecos.com/api/regenerar-plano-emergencia?email=ntbshirley@gmail.com"
-- curl "https://app.seteecos.com/api/regenerar-plano-emergencia?email=nazirasaide@gmail.com"
```

---

**✨ Boa sorte!**
