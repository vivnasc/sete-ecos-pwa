# 🚨 Diagnóstico Urgente - Cliente Nazira

## Visão Geral

Sistema completo de diagnóstico para investigar problema de registro da cliente **Nazira**, que pagou pela subscrição Vitalis mas não consegue acessar o serviço.

## Problema Identificado

- ✅ Cliente **PAGOU** pela subscrição
- ✅ Preencheu formulário de intake
- ❌ Erro de validação (altura)
- ⚠️ Dados salvos **PARCIALMENTE**
- ❌ Plano alimentar **NÃO GERADO**
- 😡 Sistema pede intake novamente = **DESMORALIZANTE**

## Ferramentas Criadas

### 🔧 Scripts Executáveis (5 arquivos)

| Arquivo | Tamanho | Propósito | Prioridade |
|---------|---------|-----------|------------|
| **testar-conexao.js** | 2.5KB | Testa conexão com Supabase | 🥇 Execute primeiro |
| **diagnostico-nazira-fetch.js** | 6.5KB | Diagnóstico completo (fetch) | 🥇 Recomendado |
| **diagnostico-nazira.js** | 11KB | Diagnóstico completo (SDK) | 🥈 Alternativa |
| **corrigir-intake.js** | 3.2KB | Corrige dados faltando | 🥉 Se necessário |
| **ajuda.js** | 3.7KB | Mostra instruções | 📖 Referência |

### 📚 Documentação (5 arquivos)

| Arquivo | Tamanho | Conteúdo |
|---------|---------|----------|
| **README-DIAGNOSTICO.md** | Este | Índice geral |
| **URGENTE-NAZIRA.md** | 5.3KB | Resumo executivo + SQL |
| **COMO-EXECUTAR.md** | 5.2KB | Guia passo a passo |
| **DIAGNOSTICO-README.md** | 2.9KB | Doc técnica |
| **ARQUIVOS-CRIADOS.txt** | 2.9KB | Lista de arquivos |

**Total:** 10 arquivos | ~48KB

## Início Rápido (3 minutos)

### 1️⃣ Obter Chave Supabase

```bash
# Acesse o dashboard
https://supabase.com/dashboard

# Navegue: Projeto vvvdtogvlutrybultffx → Settings → API
# Copie: "anon public key" (começa com eyJhbGc...)
```

### 2️⃣ Testar Conexão

```bash
cd /home/user/sete-ecos-pwa
node testar-conexao.js SUA_CHAVE_AQUI
```

**Output esperado:**
```
🔌 TESTANDO CONEXÃO SUPABASE
✅ Conexão OK
✅ Acesso à tabela users OK
✅ Total de usuárias: 42
✅ TODOS OS TESTES PASSARAM!
```

### 3️⃣ Executar Diagnóstico

```bash
node diagnostico-nazira-fetch.js SUA_CHAVE_AQUI
```

**Output esperado:**
```
🔍 DIAGNÓSTICO COMPLETO - CLIENTE NAZIRA
============================================

✅ Encontrada(s) 1 usuária(s)

👤 USUÁRIA: Nazira (nazira@email.com)

📋 DADOS BÁSICOS: [...]

⚠️ VITALIS INTAKE: INCOMPLETO
   Faltando: idade, altura_cm

✅ SUBSCRIÇÃO ATIVA

❌ NENHUM PLANO GERADO

📊 RESUMO:
   ⚠️ Cliente pagou mas não tem plano!
   🚨 AÇÃO URGENTE: Gerar plano imediatamente!
```

## Fluxo de Resolução

```
┌─────────────────────┐
│ 1. Testar Conexão   │
│ testar-conexao.js   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Diagnosticar     │
│ diagnostico-*.js    │
└──────────┬──────────┘
           │
           ▼
      ┌────┴────┐
      │         │
      ▼         ▼
┌──────────┐  ┌──────────┐
│ Completo │  │Incompleto│
└────┬─────┘  └────┬─────┘
     │             │
     │             ▼
     │     ┌──────────────┐
     │     │ 3. Corrigir  │
     │     │corrigir-*.js │
     │     └──────┬───────┘
     │            │
     └────────────┴─────┐
                        ▼
              ┌─────────────────┐
              │ 4. Gerar Plano  │
              │ (via dashboard) │
              └─────────────────┘
```

## Cenários e Soluções

### 🟢 Cenário A: Intake Completo + Sem Plano

**Situação:**
- ✅ Todos os campos preenchidos
- ✅ Subscrição ativa
- ❌ Plano não foi gerado (bug)

**Solução:**
```bash
# Acionar geração de plano via dashboard admin
# OU chamar API diretamente
```

### 🟡 Cenário B: Intake Incompleto

**Situação:**
- ⚠️ Campos faltando (idade, altura)
- ✅ Subscrição ativa
- ❌ Validação bloqueia geração

**Solução:**
```bash
# Opção 1: Completar via script
node corrigir-intake.js CHAVE USER_ID 30 165

# Opção 2: SQL direto
UPDATE vitalis_intake 
SET idade = 30, altura_cm = 165 
WHERE user_id = 'USER_ID';
```

### 🔴 Cenário C: Sem Subscrição

**Situação:**
- ❌ Nenhuma subscrição encontrada
- ⚠️ Pagamento não confirmado

**Solução:**
```sql
-- Verificar pagamentos pendentes
SELECT * FROM vitalis_payment_submissions 
WHERE user_id = 'USER_ID';

-- Criar subscrição manualmente
INSERT INTO vitalis_clients (...) VALUES (...);
```

## Scripts SQL Úteis

```sql
-- Buscar Nazira
SELECT id, email, nome FROM users 
WHERE email ILIKE '%nazira%' OR nome ILIKE '%nazira%';

-- Ver tudo da usuária
SELECT 'users' as tabela, * FROM users WHERE id = 'USER_ID'
UNION ALL
SELECT 'intake', * FROM vitalis_intake WHERE user_id = 'USER_ID'
UNION ALL
SELECT 'client', * FROM vitalis_clients WHERE user_id = 'USER_ID'
UNION ALL
SELECT 'plans', * FROM vitalis_meal_plans WHERE user_id = 'USER_ID';

-- Completar intake
UPDATE vitalis_intake 
SET idade = 30, altura_cm = 165, updated_at = NOW()
WHERE user_id = 'USER_ID';

-- Ativar subscrição
UPDATE vitalis_clients 
SET subscription_status = 'active'
WHERE user_id = 'USER_ID';
```

## Checklist de Resolução

- [ ] 1. Obter chave Supabase
- [ ] 2. Testar conexão (`testar-conexao.js`)
- [ ] 3. Executar diagnóstico (`diagnostico-nazira-fetch.js`)
- [ ] 4. Identificar problema específico
- [ ] 5. Aplicar correção adequada
- [ ] 6. Gerar plano alimentar
- [ ] 7. Testar acesso da cliente
- [ ] 8. Notificar Nazira
- [ ] 9. Notificar Vivianne (owner)
- [ ] 10. Documentar caso para prevenção

## Comandos Rápidos

```bash
# Ver ajuda
node ajuda.js

# Testar
node testar-conexao.js CHAVE

# Diagnosticar (recomendado)
node diagnostico-nazira-fetch.js CHAVE

# Diagnosticar (alternativa)
node diagnostico-nazira.js CHAVE

# Corrigir
node corrigir-intake.js CHAVE USER_ID IDADE ALTURA

# Listar arquivos criados
cat ARQUIVOS-CRIADOS.txt
```

## Estrutura de Arquivos

```
/home/user/sete-ecos-pwa/
│
├── 🔧 Scripts Executáveis
│   ├── testar-conexao.js          ← Testa conexão
│   ├── diagnostico-nazira-fetch.js ← Diagnóstico (fetch)
│   ├── diagnostico-nazira.js       ← Diagnóstico (SDK)
│   ├── corrigir-intake.js         ← Correção de dados
│   └── ajuda.js                   ← Ajuda interativa
│
└── 📚 Documentação
    ├── README-DIAGNOSTICO.md      ← Este arquivo (índice)
    ├── URGENTE-NAZIRA.md          ← Resumo executivo
    ├── COMO-EXECUTAR.md           ← Guia passo a passo
    ├── DIAGNOSTICO-README.md      ← Doc técnica
    └── ARQUIVOS-CRIADOS.txt       ← Lista simples
```

## Tempo Estimado

| Etapa | Tempo |
|-------|-------|
| Obter chave Supabase | 1 min |
| Testar conexão | 30 seg |
| Executar diagnóstico | 1 min |
| Analisar output | 2 min |
| Aplicar correção | 3 min |
| Gerar plano | 1 min |
| Testar + notificar | 2 min |
| **TOTAL** | **~10 min** |

## Segurança

✅ **Chave anon/public é SEGURA de usar:**
- Exposta no frontend por design
- Protegida por RLS (Row Level Security)
- Permissões limitadas ao necessário

❌ **NUNCA use a chave service_role:**
- Tem acesso total ao banco
- Bypass de todas as políticas RLS
- Apenas para operações administrativas

## Suporte

### Documentação Detalhada
- **Urgente:** `URGENTE-NAZIRA.md`
- **Como fazer:** `COMO-EXECUTAR.md`
- **Técnica:** `DIAGNOSTICO-README.md`

### Ajuda Interativa
```bash
node ajuda.js
```

### Estrutura do Projeto
Ver: `/home/user/sete-ecos-pwa/CLAUDE.md`

## Próximos Passos

1. **Imediato:** Resolver caso da Nazira
2. **Curto prazo:** Melhorar validação de formulário
3. **Médio prazo:** Adicionar salvamento automático
4. **Longo prazo:** Dashboard de monitoramento de clientes

## Prevenção Futura

### Melhorias no Código
- [ ] Validação mais tolerante (não bloquear envio)
- [ ] Salvamento automático a cada campo
- [ ] Retry automático na geração de plano
- [ ] Mensagens de erro mais claras

### Monitoramento
- [ ] Alert quando subscrição ativa sem plano
- [ ] Dashboard de clientes com problemas
- [ ] Log de erros de validação
- [ ] Métricas de sucesso de onboarding

---

## 🚀 Ação Imediata

**Execute AGORA:**

```bash
node ajuda.js  # Ver instruções completas
```

**Prioridade:** 🔴 URGENTE - Cliente pagante esperando!

---

*Criado em: 2026-02-12*  
*Localização: /home/user/sete-ecos-pwa/*  
*Owner: Vivianne dos Santos*  
*Plataforma: SETE ECOS - Vitalis*
