# 🛡️ PREVENÇÃO DE BUGS NO PLANO - VITALIS

## 📋 **BUGS CORRIGIDOS (Fevereiro 2026)**

### **Caso Nazira - altura_cm = 1**

**PROBLEMA:**
- Cliente pagou, preencheu intake
- Sistema salvou `altura_cm = 1` (erro!)
- Plano não foi gerado
- Cliente desmoralizada

**CAUSA RAIZ:**
Validação só verificava `num > 0` → aceitava qualquer número

**SOLUÇÃO:**
✅ Validação de ranges realistas implementada

---

## ✅ **VALIDAÇÕES IMPLEMENTADAS**

### **1. Altura (altura_cm)**
```javascript
if (num < 140 || num > 220) {
  error = 'Altura deve estar entre 140-220cm';
}
```
- ❌ Bloqueia: 1cm, 50cm, 999cm
- ✅ Aceita: 140-220cm (range humano realista)

### **2. Peso (peso_actual, peso_meta)**
```javascript
if (num < 30 || num > 300) {
  error = 'Peso deve estar entre 30-300kg';
}
```
- ❌ Bloqueia: 5kg, 500kg
- ✅ Aceita: 30-300kg (adultos)

### **3. Idade**
```javascript
if (num < 18 || num > 100) {
  error = 'Idade deve estar entre 18-100 anos';
}
```
- ❌ Bloqueia: 5 anos, 200 anos
- ✅ Aceita: 18-100 anos (público-alvo)

### **4. Intake Completo**
```javascript
// Dashboard verifica campos OBRIGATÓRIOS
const intakeCompleto = intakeData &&
  intakeData.altura_cm &&    // ✅ TEM altura?
  intakeData.peso_actual &&  // ✅ TEM peso?
  intakeData.idade;          // ✅ TEM idade?
```

---

## 🎯 **FERRAMENTAS DE MONITORIZAÇÃO**

### **1. Coach Dashboard (/vitalis/coach)**

**Indicadores Visuais:**
- ✅/❌ **Intake** - mostra se está completo
- ✅/❌ **Plano** - mostra se foi gerado

**Ações Rápidas:**
- 🍽️ **Gerar Plano** - botão direto
- 📧 **Email** - comunicação rápida
- 💬 **WhatsApp** - suporte instantâneo

**Como Usar:**
1. Aceder `/vitalis/coach`
2. Ver lista de clientes
3. Verificar status num relance
4. Gerar plano se necessário

### **2. Scripts de Diagnóstico**

**ver-nazira.js** - Ver estado de qualquer cliente:
```bash
node ver-nazira.js <SUPABASE_KEY>
```

**SQL de Verificação:**
```sql
SELECT
  u.nome,
  vi.altura_cm,
  vi.peso_actual,
  vi.idade,
  vc.subscription_status,
  (SELECT COUNT(*) FROM vitalis_meal_plans WHERE user_id = u.id) as tem_plano
FROM users u
LEFT JOIN vitalis_intake vi ON vi.user_id = u.id
LEFT JOIN vitalis_clients vc ON vc.user_id = u.id
WHERE u.nome ILIKE '%NOME%';
```

---

## 🔄 **PROTOCOLO DE RECOVERY**

### **Se Cliente Reportar Problema:**

1. **Verificar Status** (Coach Dashboard)
   - Tem intake completo? (✅/❌)
   - Tem plano gerado? (✅/❌)
   - Subscription ativa? (✅/❌)

2. **Diagnóstico SQL** (se necessário)
   ```sql
   SELECT * FROM vitalis_intake WHERE user_id = 'UUID';
   SELECT * FROM vitalis_meal_plans WHERE user_id = 'UUID';
   ```

3. **Correção**
   - **Falta intake:** Pedir logout/login (vai para intake)
   - **Intake incompleto:** Corrigir campos via SQL
   - **Falta plano:** Gerar via Coach Dashboard

4. **Validação**
   - Cliente faz logout/login
   - Verifica se tem acesso ao plano
   - Confirma que tudo funciona

---

## 📊 **CHECKLIST ANTES DE LANÇAMENTO**

### **Para Cada Nova Feature:**
- [ ] Validar inputs com ranges realistas
- [ ] Testar com dados inválidos (1, 999, negativo, etc.)
- [ ] Verificar campos obrigatórios
- [ ] Testar fluxo completo (happy path + error path)
- [ ] Adicionar logs para debug
- [ ] Documentar no CLAUDE.md

### **Para Cada Cliente Novo:**
- [ ] Verificar intake completo (Coach Dashboard)
- [ ] Verificar plano gerado (Coach Dashboard)
- [ ] Enviar mensagem de boas-vindas
- [ ] Monitorizar primeiros 3 dias

---

## 🚨 **RED FLAGS - Atenção Imediata**

Se vir isto no Coach Dashboard:
- ✅ Intake MAS ❌ Plano → **GERAR PLANO AGORA!**
- ❌ Intake → Cliente pode estar preso no fluxo
- Subscription: `active` mas sem plano → **BUG CRÍTICO!**

---

## 📝 **COMMITS RELACIONADOS**

- `16c461f` - Validação ranges realistas
- `84641f6` - Verificar intake completo
- `d7d77c8` - Coach Dashboard melhorias
- `c1ebee2` - Script diagnóstico rápido

---

## 🎓 **LIÇÕES APRENDIDAS**

1. **Nunca assumir que "num > 0" é suficiente**
   - Sempre validar ranges realistas
   - Pensar em edge cases (1, 999, etc.)

2. **UPSERT pode salvar dados parciais**
   - Verificar campos OBRIGATÓRIOS antes de marcar como completo
   - Usar flag `completed_at` se necessário

3. **Cliente pagante = prioridade máxima**
   - Bugs no onboarding = cliente desmoralizada
   - Recovery rápido é essencial

4. **Ferramentas de monitorização são essenciais**
   - Coach Dashboard salva tempo
   - Scripts de diagnóstico previnem escalação

---

## ✅ **STATUS ATUAL**

- ✅ Bugs corrigidos
- ✅ Validações implementadas
- ✅ Ferramentas de monitorização prontas
- ✅ Protocolo de recovery documentado
- ✅ Nazira corrigida (altura 1→162cm)

**PRÓXIMO BUG NO PLANO: NÃO VAI ACONTECER!** 🛡️
