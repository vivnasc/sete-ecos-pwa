# 🚨 URGENTE - DIAGNÓSTICO CLIENTE NAZIRA

## Situação Crítica

**CLIENTE PAGANTE COM PROBLEMA DE ACESSO**

- ✅ Nazira PAGOU pela subscrição Vitalis
- ✅ Preencheu formulário de intake
- ❌ Deu erro de validação na altura
- ⚠️  Dados ficaram PARCIALMENTE salvos
- ❌ Plano alimentar NÃO foi gerado
- 😡 Sistema pede intake de novo = **DESMORALIZANTE**

## Ferramentas Criadas

### 📊 Scripts de Diagnóstico

1. **diagnostico-nazira.js** (11KB)
   - Versão completa usando SDK Supabase
   - Diagnóstico detalhado de todas as tabelas

2. **diagnostico-nazira-fetch.js** (6.5KB) ⭐ RECOMENDADO
   - Versão leve usando apenas fetch
   - Sem dependências extras
   - Mais rápido de executar

3. **corrigir-intake.js** (3.2KB)
   - Script para CORRIGIR dados faltando
   - Completa campos obrigatórios
   - Atualiza intake diretamente no banco

### 📚 Documentação

1. **DIAGNOSTICO-README.md** - Visão geral técnica
2. **COMO-EXECUTAR.md** - Guia passo a passo detalhado
3. **URGENTE-NAZIRA.md** - Este arquivo (resumo executivo)

## Como Executar AGORA

### PASSO 1: Obter Chave Supabase (30 segundos)

```
1. Abra: https://supabase.com/dashboard
2. Projeto: vvvdtogvlutrybultffx
3. Settings → API
4. Copie: "anon public key"
```

### PASSO 2: Executar Diagnóstico (10 segundos)

```bash
cd /home/user/sete-ecos-pwa
node diagnostico-nazira-fetch.js SUA_CHAVE_AQUI
```

### PASSO 3: Analisar Output

O script vai mostrar:

```
✅ Intake preenchido: SIM/NÃO
⚠️  Intake completo: SIM/NÃO  ← FOCO AQUI
✅ Subscrição ativa: SIM/NÃO
❌ Plano gerado: SIM/NÃO      ← PROBLEMA CRÍTICO
```

## Cenários Possíveis

### Cenário A: Intake Incompleto + Subscrição Ativa

**Diagnóstico:**
```
⚠️  Intake PARCIAL (faltam: idade, altura_cm)
✅ Subscrição ATIVA
❌ Plano NÃO gerado
```

**Solução Rápida:**
```bash
# Completar dados manualmente
node corrigir-intake.js CHAVE USER_ID 30 165

# Depois, gerar plano via dashboard admin
```

### Cenário B: Intake Completo + Subscrição Ativa + Sem Plano

**Diagnóstico:**
```
✅ Intake COMPLETO
✅ Subscrição ATIVA
❌ Plano NÃO gerado  ← Bug na geração
```

**Solução:**
- Acionar manualmente a geração do plano
- Verificar logs de erro da API

### Cenário C: Nenhuma Subscrição Encontrada

**Diagnóstico:**
```
⚠️  Intake parcial
❌ Subscrição NÃO encontrada
```

**Solução:**
- Verificar se pagamento foi confirmado
- Criar subscrição manualmente se pagamento OK

## Scripts SQL de Emergência

### Ver todos os dados da Nazira:

```sql
-- Buscar user_id
SELECT id, email, nome FROM users WHERE email ILIKE '%nazira%';

-- Ver intake
SELECT * FROM vitalis_intake WHERE user_id = 'USER_ID_AQUI';

-- Ver subscrição
SELECT * FROM vitalis_clients WHERE user_id = 'USER_ID_AQUI';

-- Ver planos
SELECT * FROM vitalis_meal_plans WHERE user_id = 'USER_ID_AQUI';
```

### Completar intake manualmente:

```sql
UPDATE vitalis_intake 
SET 
  idade = 30,
  altura_cm = 165,
  updated_at = NOW()
WHERE user_id = 'USER_ID_AQUI';
```

### Criar subscrição se não existe:

```sql
INSERT INTO vitalis_clients (
  user_id,
  subscription_status,
  subscription_type,
  subscription_start,
  subscription_end
) VALUES (
  'USER_ID_AQUI',
  'active',
  'monthly',
  NOW(),
  NOW() + INTERVAL '30 days'
);
```

## Checklist de Ação

- [ ] 1. Executar script de diagnóstico
- [ ] 2. Identificar campos faltando
- [ ] 3. Completar dados (script ou SQL)
- [ ] 4. Verificar subscrição está ativa
- [ ] 5. Gerar plano alimentar
- [ ] 6. Testar acesso da cliente
- [ ] 7. Notificar Nazira que foi resolvido

## Contatos Importantes

**Vivianne dos Santos** - Owner
- Precisa ser notificada do problema
- Aprovar solução aplicada

**Nazira** - Cliente
- Deve receber pedido de desculpas
- Explicação do que aconteceu
- Confirmação que foi resolvido

## Tempo Estimado

- ⏱️  Diagnóstico: **2 minutos**
- ⏱️  Correção: **5 minutos**
- ⏱️  Geração de plano: **1 minuto**
- ⏱️  **TOTAL: ~10 minutos**

## Prevenção Futura

Após resolver este caso:

1. **Ajustar validação de formulário**
   - Permitir envio com dados parciais
   - Salvar progresso automaticamente

2. **Melhorar UX de erro**
   - Não perder dados já preenchidos
   - Mostrar campos específicos com erro

3. **Adicionar retry automático**
   - Se geração de plano falhar
   - Tentar novamente em background

4. **Monitoramento**
   - Alertar quando subscrição ativa sem plano
   - Dashboard de clientes com problemas

## Arquivos no Projeto

```
/home/user/sete-ecos-pwa/
├── diagnostico-nazira.js           ← Script completo (SDK)
├── diagnostico-nazira-fetch.js     ← Script leve (fetch) ⭐
├── corrigir-intake.js             ← Script de correção
├── DIAGNOSTICO-README.md          ← Doc técnica
├── COMO-EXECUTAR.md              ← Guia passo a passo
└── URGENTE-NAZIRA.md             ← Este resumo
```

---

## AÇÃO IMEDIATA NECESSÁRIA

⚠️  **Cliente pagante sem acesso ao serviço**  
⚠️  **Risco de churn e reclamação pública**  
⚠️  **Resolver HOJE!**

Execute o diagnóstico AGORA e compartilhe o output!

```bash
node diagnostico-nazira-fetch.js SUA_CHAVE_SUPABASE
```

---

*Criado em: 2026-02-12*  
*Status: URGENTE - Aguardando execução*
