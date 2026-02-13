# 🚀 COMANDOS PARA EXECUTAR MANUALMENTE

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

### **Opção A: Via API (se firewall permitir)**

```bash
curl "https://app.seteecos.com/api/gerar-plano-manual?secret=vivnasc2026&email=ntbshirley@gmail.com"
```

**OU via regeneração:**
```bash
curl "https://app.seteecos.com/api/regenerar-plano-emergencia?email=ntbshirley@gmail.com"
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

## 2️⃣ **TESTAR PDF DA NAZIRTA**

### **Testar endpoint correto (POST):**

```bash
curl -X POST https://app.seteecos.com/api/gerar-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "planoId": "08071c48-235b-4033-aaef-8e6e65c8f053",
    "baseUrl": "https://app.seteecos.com"
  }' \
  -o nazirta-teste.pdf
```

**Se funcionar:** Arquivo `nazirta-teste.pdf` será criado! ✅

**Se falhar:** Verificar logs do Vercel:
```bash
# Dashboard Vercel > sete-ecos-pwa > Functions > gerar-pdf > Logs
```

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
