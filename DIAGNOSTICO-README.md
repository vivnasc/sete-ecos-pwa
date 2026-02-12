# Script de Diagnóstico - Cliente Nazira

## Objetivo

Investigar URGENTEMENTE o estado completo do registo da cliente Nazira no Supabase para identificar por que o plano alimentar não foi gerado após pagamento.

## O Que o Script Faz

O script `diagnostico-nazira.js` consulta todas as tabelas relevantes do Supabase:

1. **users** - Dados básicos da usuária
2. **vitalis_intake** - Dados antropométricos (altura, peso, idade, etc.)
3. **vitalis_clients** - Status da subscrição (active, pending, etc.)
4. **vitalis_meal_plans** - Planos alimentares gerados
5. **vitalis_payment_submissions** - Confirmações de pagamento

## Como Usar

### Opção 1: Passar chave como argumento

```bash
node diagnostico-nazira.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Opção 2: Usar variável de ambiente

```bash
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... node diagnostico-nazira.js
```

### Opção 3: Exportar variável de ambiente

```bash
export VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
node diagnostico-nazira.js
```

## Output Esperado

O script produz um relatório colorido com:

- ✅ **Verde** = Dados encontrados/completos
- ❌ **Vermelho** = Dados ausentes/problemas críticos
- ⚠️ **Amarelo** = Avisos/dados parciais

### Seções do Relatório

1. **DADOS BÁSICOS** - ID, email, nome, gênero
2. **VITALIS INTAKE** - Campos obrigatórios (nome, idade, altura, peso)
3. **SUBSCRIÇÃO** - Status, tipo, datas
4. **PLANOS ALIMENTARES** - Se existem planos gerados
5. **PAGAMENTOS** - Confirmações submetidas
6. **RESUMO** - Checklist completo + diagnóstico de problemas

## Problemas Identificados Automaticamente

O script detecta automaticamente:

- ❌ **Intake incompleto** - Campos obrigatórios faltando
- ❌ **Subscrição sem plano** - Cliente pagou mas não tem plano (CRÍTICO!)
- ⚠️ **Dados parciais** - Alguns campos preenchidos, outros não

## Soluções Sugeridas

Baseado no diagnóstico, o script sugere:

1. **Completar intake manualmente** (via SQL)
2. **Ajustar validação** (aceitar dados parciais)
3. **Gerar plano imediatamente** (se dados suficientes)

## Obter a Chave Supabase

A chave anon pública do Supabase está em:

1. Projeto Supabase → Settings → API
2. Copiar "anon public" key
3. É seguro usar (chave pública, não secreta)

## Próximos Passos

Após executar o diagnóstico:

1. Analisar output do script
2. Identificar campos faltando
3. Decidir ação: completar dados OU ajustar validação
4. Gerar plano alimentar para a cliente

## Urgência

⚠️ **CLIENTE PAGANTE ESPERANDO!**

Esta é uma situação crítica pois:
- Cliente PAGOU pela subscrição
- Preencheu intake mas deu erro
- Sistema pede intake de novo → DESMORALIZANTE
- Sem plano alimentar = SEM SERVIÇO

---

**Arquivo:** `/home/user/sete-ecos-pwa/diagnostico-nazira.js`
