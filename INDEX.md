# 📑 Índice - Sistema de Diagnóstico Nazira

## Navegação Rápida

### 🚀 Para Começar AGORA

1. **[INICIO-RAPIDO.txt](./INICIO-RAPIDO.txt)** ⭐ COMECE AQUI
   - Solução em 3 passos
   - 5 minutos de leitura
   - Comandos prontos para copiar

2. **[README-DIAGNOSTICO.md](./README-DIAGNOSTICO.md)** 📖 Referência Completa
   - Índice detalhado de tudo
   - Fluxogramas e cenários
   - Checklist de resolução

### 📚 Documentação Adicional

3. **[URGENTE-NAZIRA.md](./URGENTE-NAZIRA.md)** 🚨 Resumo Executivo
   - Contexto da situação crítica
   - Scripts SQL de emergência
   - Contatos importantes

4. **[COMO-EXECUTAR.md](./COMO-EXECUTAR.md)** 📝 Guia Passo a Passo
   - Instruções detalhadas
   - Exemplos de output esperado
   - Troubleshooting completo

5. **[DIAGNOSTICO-README.md](./DIAGNOSTICO-README.md)** 🔧 Doc Técnica
   - Arquitetura do sistema
   - Problemas detectados automaticamente
   - Próximos passos

6. **[ARQUIVOS-CRIADOS.txt](./ARQUIVOS-CRIADOS.txt)** 📋 Lista Simples
   - Todos os arquivos criados
   - Propósito de cada um
   - Ordem de execução

## 🛠️ Scripts Executáveis

### Ordem de Execução Recomendada

1. **testar-conexao.js** (2.8KB)
   ```bash
   node testar-conexao.js <CHAVE_SUPABASE>
   ```
   - Testa se a chave Supabase funciona
   - Verifica acesso às tabelas
   - Execute PRIMEIRO

2. **diagnostico-nazira-fetch.js** (6.5KB) ⭐ RECOMENDADO
   ```bash
   node diagnostico-nazira-fetch.js <CHAVE_SUPABASE>
   ```
   - Diagnóstico completo via fetch
   - Mais rápido, sem dependências
   - Execute para diagnosticar

3. **diagnostico-nazira.js** (11KB)
   ```bash
   node diagnostico-nazira.js <CHAVE_SUPABASE>
   ```
   - Diagnóstico via SDK Supabase
   - Alternativa mais completa
   - Use se fetch não funcionar

4. **corrigir-intake.js** (3.2KB)
   ```bash
   node corrigir-intake.js <CHAVE> <USER_ID> <idade> <altura>
   ```
   - Corrige dados faltando
   - Atualiza intake diretamente
   - Execute SE diagnóstico mostrar campos faltando

5. **ajuda.js** (3.7KB)
   ```bash
   node ajuda.js
   ```
   - Mostra instruções interativas
   - Exemplos de uso
   - Referência rápida

## 📊 Estrutura de Arquivos

```
/home/user/sete-ecos-pwa/
│
├── INDEX.md                       ← Você está aqui (navegação)
│
├── 🚀 Início Rápido
│   ├── INICIO-RAPIDO.txt          ← COMECE AQUI (3 passos)
│   └── README-DIAGNOSTICO.md      ← Referência completa
│
├── 📚 Documentação
│   ├── URGENTE-NAZIRA.md          ← Resumo executivo + SQL
│   ├── COMO-EXECUTAR.md           ← Guia passo a passo
│   ├── DIAGNOSTICO-README.md      ← Doc técnica
│   └── ARQUIVOS-CRIADOS.txt       ← Lista simples
│
└── 🛠️ Scripts
    ├── testar-conexao.js          ← 1. Testar (execute primeiro)
    ├── diagnostico-nazira-fetch.js ← 2. Diagnosticar (recomendado)
    ├── diagnostico-nazira.js       ← 2. Diagnosticar (alternativa)
    ├── corrigir-intake.js         ← 3. Corrigir (se necessário)
    └── ajuda.js                   ← Ajuda interativa
```

## 🎯 Atalhos por Cenário

### "Nunca usei, não sei por onde começar"
→ Leia: **[INICIO-RAPIDO.txt](./INICIO-RAPIDO.txt)**

### "Quero ver TODAS as opções disponíveis"
→ Leia: **[README-DIAGNOSTICO.md](./README-DIAGNOSTICO.md)**

### "Preciso de SQL para executar manualmente"
→ Leia: **[URGENTE-NAZIRA.md](./URGENTE-NAZIRA.md)**

### "Encontrei um erro ao executar o script"
→ Leia: **[COMO-EXECUTAR.md](./COMO-EXECUTAR.md)** (seção Troubleshooting)

### "Quero entender a arquitetura técnica"
→ Leia: **[DIAGNOSTICO-README.md](./DIAGNOSTICO-README.md)**

### "Quero só uma lista de todos os arquivos"
→ Leia: **[ARQUIVOS-CRIADOS.txt](./ARQUIVOS-CRIADOS.txt)**

## 💡 Comandos Mais Usados

```bash
# Ver ajuda interativa
node ajuda.js

# Testar conexão
node testar-conexao.js CHAVE

# Diagnosticar (recomendado)
node diagnostico-nazira-fetch.js CHAVE

# Corrigir intake
node corrigir-intake.js CHAVE USER_ID IDADE ALTURA

# Ver este índice
cat INDEX.md

# Ver início rápido
cat INICIO-RAPIDO.txt

# Listar todos os arquivos criados
ls -lh diagnostico* corrigir* ajuda* testar* *.md *.txt
```

## 📞 Suporte

- **Documentação técnica:** DIAGNOSTICO-README.md
- **Guia passo a passo:** COMO-EXECUTAR.md
- **Ajuda interativa:** `node ajuda.js`
- **Projeto SETE ECOS:** /home/user/sete-ecos-pwa/CLAUDE.md

## ⏱️ Tempo Estimado

| Tarefa | Tempo |
|--------|-------|
| Ler início rápido | 3 min |
| Obter chave Supabase | 1 min |
| Testar conexão | 0.5 min |
| Executar diagnóstico | 1 min |
| Analisar resultado | 2 min |
| Aplicar correção | 3 min |
| **TOTAL** | **~10 min** |

## 🚨 Prioridade

**URGENTE** - Cliente pagante sem acesso ao serviço!

## 📍 Próxima Ação

Execute AGORA:

```bash
cat INICIO-RAPIDO.txt
```

Ou para ajuda interativa:

```bash
node ajuda.js
```

---

*Sistema criado em: 2026-02-12*  
*Total de arquivos: 11*  
*Tamanho total: ~62KB*  
*Localização: /home/user/sete-ecos-pwa/*

**Owner:** Vivianne dos Santos  
**Plataforma:** SETE ECOS - Vitalis  
**Status:** ⏳ Aguardando execução
