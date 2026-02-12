# Como Executar o Diagnóstico da Nazira

## Scripts Disponíveis

Criei **2 versões** do script de diagnóstico:

### 1. diagnostico-nazira.js (versão completa)
Usa o SDK oficial do Supabase (`@supabase/supabase-js`)

### 2. diagnostico-nazira-fetch.js (versão alternativa)
Usa apenas fetch nativo do Node.js (sem dependências extras)

## Passo a Passo

### PASSO 1: Obter a Chave do Supabase

1. Acesse: https://supabase.com/dashboard
2. Entre no projeto: **vvvdtogvlutrybultffx**
3. Vá em: **Settings** → **API**
4. Copie a chave **anon/public** (NÃO a service_role)

Exemplo da chave:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dmR0b2d2bHV0cnlidWx0ZmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYyNjI0MDAsImV4cCI6MjAxMTgzODQwMH0.xxxxxxxxxxxxxxxxxxxxx
```

### PASSO 2: Executar o Script

Abra o terminal no diretório do projeto e execute:

```bash
# Opção A: Passar chave como argumento
node diagnostico-nazira-fetch.js SUA_CHAVE_AQUI

# Opção B: Usar variável de ambiente
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_AQUI node diagnostico-nazira-fetch.js
```

### PASSO 3: Analisar o Output

O script vai mostrar:

```
================================================================================
🔍 DIAGNÓSTICO COMPLETO - CLIENTE NAZIRA
================================================================================

------------------------------------------------------------
1. BUSCAR USUÁRIA
------------------------------------------------------------
✅ Encontrada(s) 1 usuária(s)

------------------------------------------------------------
👤 USUÁRIA: Nazira (nazira@example.com)
------------------------------------------------------------

📋 DADOS BÁSICOS:
{
  "id": "uuid-aqui",
  "email": "nazira@example.com",
  "nome": "Nazira",
  ...
}

------------------------------------------------------------
2. VITALIS INTAKE
------------------------------------------------------------
✅ Encontrado(s) 1 registo(s)

--- Registo 1 ---
{
  "nome": "Nazira",
  "idade": null,        ← ❌ FALTANDO
  "altura_cm": null,    ← ❌ FALTANDO
  "peso_actual": 70,    ← ✅ TEM
  ...
}

⚠️  FALTANDO: idade, altura_cm

------------------------------------------------------------
3. VITALIS CLIENTS (Subscrição)
------------------------------------------------------------
✅ 1 subscrição(ões)

--- Subscrição 1 ---
{
  "status": "active",   ← ✅ PAGOU!
  "type": "monthly",
  ...
}

✅ ATIVA!

------------------------------------------------------------
4. VITALIS MEAL PLANS
------------------------------------------------------------
❌ NENHUM PLANO GERADO  ← 🚨 PROBLEMA CRÍTICO!
```

## O Que Procurar no Output

### ✅ CENÁRIO BOM
```
✅ Intake completo
✅ Subscrição ativa
✅ Plano gerado
```
→ Tudo OK, cliente pode usar o sistema

### ⚠️ CENÁRIO PROBLEMA (esperado para Nazira)
```
⚠️  Intake INCOMPLETO (faltam campos)
✅ Subscrição ATIVA (pagou!)
❌ Plano NÃO gerado
```
→ Cliente pagou mas não consegue usar = URGENTE!

## Próximas Ações Baseadas no Diagnóstico

### Se INTAKE está incompleto:

**Opção 1: Completar dados manualmente**
```sql
UPDATE vitalis_intake 
SET 
  idade = 30,
  altura_cm = 165
WHERE user_id = 'uuid-da-nazira';
```

**Opção 2: Ajustar validação no código**
- Tornar idade/altura opcionais temporariamente
- Permitir geração de plano com dados parciais

### Se PLANO não foi gerado:

**Gerar plano manualmente via API/função:**
```javascript
// Chamar função de geração de plano
await gerarPlanoAlimentar(userId);
```

## Exemplo de Execução Real

```bash
$ cd /home/user/sete-ecos-pwa
$ node diagnostico-nazira-fetch.js eyJhbGc...

================================================================================
🔍 DIAGNÓSTICO COMPLETO - CLIENTE NAZIRA
================================================================================
Conectando ao Supabase: https://vvvdtogvlutrybultffx.supabase.co

------------------------------------------------------------
1. BUSCAR USUÁRIA
------------------------------------------------------------
✅ Encontrada(s) 1 usuária(s)

...
[output detalhado]
...
```

## Troubleshooting

### Erro: "Nenhuma usuária encontrada"
- Verificar se o nome está correto no banco
- Tentar buscar por email
- Script mostra últimas 10 usuárias automaticamente

### Erro: "HTTP 401"
- Chave Supabase inválida ou expirada
- Verificar se copiou a chave completa

### Erro: "Connection refused"
- Verificar conexão com internet
- Confirmar URL do Supabase está correta

## Arquivos Criados

```
/home/user/sete-ecos-pwa/
├── diagnostico-nazira.js           ← Script principal (SDK Supabase)
├── diagnostico-nazira-fetch.js     ← Script alternativo (fetch puro)
├── DIAGNOSTICO-README.md           ← Documentação técnica
└── COMO-EXECUTAR.md               ← Este guia
```

## Segurança

A chave **anon/public** do Supabase é SEGURA de usar pois:
- É pública por design (usada no frontend)
- Tem permissões limitadas por RLS (Row Level Security)
- NÃO é a chave service_role (que tem acesso total)

---

**IMPORTANTE**: Depois de executar, copie todo o output e analise junto com a equipe para decidir a melhor ação!
