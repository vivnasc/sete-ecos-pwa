# FénixFit · Estado e Contexto

**Última actualização**: 7 maio 2026
**Branch actual**: `claude/monorepo-lifestyle-app-ZAA2E`
**URL produção**: `https://sete-ecos-pwa.pages.dev/`
**Deploy**: Cloudflare Pages (auto-deploy do branch acima)

---

## O que é

App PWA pessoal da Vivianne para acompanhar plano de 60 dias (11 maio – 9 julho 2026): keto cíclico, jejum 14h, treino 4×/semana, regulação do sistema nervoso, redução de álcool. **Tom: espelho calmo. Visual: editorial.**

Sub-app dentro do monorepo `vivnasc/sete-ecos-pwa` (em `apps/reset/`).

---

## Stack actual

| | |
|--|--|
| **Framework** | Next.js 14 + TypeScript (output: 'export') |
| **Styling** | Tailwind v3 + Fraunces (serif variável) + Inter |
| **Auth + DB** | Supabase (RLS por user_id) |
| **AI** | Claude Sonnet 4.6 via fetch directo (Cloudflare Pages Functions) |
| **Deploy** | Cloudflare Pages, static export |
| **Storage** | localStorage (cache offline) + Supabase (sync entre devices) |

---

## Features construídas (completas)

### Páginas (19)
- `/` Dashboard (Hoje) — saudação por hora, mantra, painel matinal, âncoras, métricas
- `/diario` — strip 60 dias + registo diário (sono/energia/humor/notas)
- `/peso` — pesagem diária + cintura (sextas) + gráficos + média móvel 7d
- `/jejum` — timer adaptativo, meta 14h/16h, streak, histórico
- `/ciclo` — fases (menstruação/folicular/ovulação/lútea), sintomas, cravings, correlações com álcool/humor
- `/scanner` — pontuação 0-100, habit chains, padrões cruzados, anomalias, melhores dias, projecção 14d
- `/coach` — chat IA com contexto completo + abertura automática diária
- `/alcool` — caderno antes do copo (emoção+gatilho+decides) + padrões
- `/medidas` — sheet modal periódico
- `/desabafo` — diário privado + tags emoção
- `/insights` — leitura semanal por Claude
- `/receitas` — keto + lista de compras
- `/treino` — plano semanal
- `/mais` — menu hub
- `/definicoes` — perfil + tema + 5 paletas + lembretes + sync + backup
- `/login` — email + password
- `/logos` — 3 SVG variants
- `/limpar` — kill switch (caches + reset total)

### Componentes-chave
- **AuthGate** — auth + hydration timeout 5s + skip button aos 3s
- **OnboardingGate** — não bloqueia, decide instantaneamente em localStorage
- **ThemeProvider** — light/dark/system + 5 paletas (clássica, rosa, azul, ouro, verde)
- **SmartNow** — bloco contextual por hora do dia (madrugada → noite)
- **MorningPanel** — peso + eletrólitos + treino + romper jejum (compacto)
- **JanelaTimer** — timer de jejum em tempo real, adaptativo
- **CoachGreetingCard** — preview da abertura diária da coach no Hoje
- **QuickTools** — grelha 3 cols com peso/jejum/ciclo/scanner/coach/copo
- **AnchorChecklist** — 7 âncoras tocáveis
- **Heatmap** — 60 dias estilo GitHub contributions
- **HabitChains** — grelha 7 âncoras × 60 dias com streak por âncora
- **TrendChart** — SVG line chart
- **ErrorBoundary** + **SafeBlock** — isola erros por componente
- **BackButton** — em todas subpáginas
- **InstallPrompt** — iOS A2HS

### Pages Functions (Cloudflare)
- `functions/api/coach.ts` — chat com contexto completo + saudação automática
- `functions/api/insights.ts` — análise semanal

### Schema Supabase (9 tabelas)
- `fenixfit_profile`, `fenixfit_dias`, `fenixfit_alcool`, `fenixfit_medidas`, `fenixfit_desabafo`, `fenixfit_insights`, `fenixfit_peso`, `fenixfit_jejum`, `fenixfit_ciclo` — todas com RLS

### Logos (3 SVG)
- `logo-01-wordmark.svg` — tipográfico editorial
- `logo-02-bird.svg` — pássaro fénix linha contínua (usado como icon principal)
- `logo-03-seal.svg` — selo circular FF

---

## Decisões arquitectónicas importantes

1. **Static export** (`output: 'export'`) — sem SSR, sem worker complexo
2. **Bundle único** (`splitChunks: false`) — webpack config força um main bundle de ~86kB
3. **Navegação com `<a>` em vez de `<Link>`** — full reload, evita problemas de chunks dinâmicos
4. **Service Worker desligado** — `RegisterSW` agora apenas DESREGISTA SWs antigos. Não há `public/sw.js`.
5. **Pages Functions nativas** — `/api/coach` e `/api/insights` em `functions/` (não `app/api/`)
6. **Container responsivo** — mobile 440px → tablet 560px → md 680px → lg 780px
7. **localStorage primary, Supabase sync** — app funciona offline, sincroniza em background

---

## Desafios enfrentados (cronologia)

1. **Netlify rejeitou registo (Moçambique)** → migrou para Cloudflare
2. **Vercel limites pessoais** → preferiu não usar
3. **next-on-pages worker** → bundle muito grande, builds inconsistentes
4. **Chunks 500 persistentes** → causados por:
   - Service worker antigo cacheando referências obsoletas
   - Mismatch entre HTML e chunks após cada novo deploy
   - CDN Cloudflare a servir versões mistas
5. **Solução final** → static export + bundle único + `<a>` tags + SW desligado
6. **App agora funciona** mas com trade-off: navegação com reload completo (~300ms extra)

---

## Bugs conhecidos

### QuickTools não aparece no Hoje
- O componente está em `components/QuickTools.tsx` e referenciado em `app/page.tsx`
- Está envolto em `SafeBlock` que silenciosamente esconde se houver erro
- Provável causa: alguma linha do componente está a partir
- Próximo passo: verificar console em browser, ou remover SafeBlock temporariamente para ver erro real

---

## Plano em fases (próximas iterações)

### ⚠️ TIER 0 · GAPS BÁSICOS (CRÍTICO · pedido directo da Vivianne)

**A app tem tracking de outcomes mas falta o tracking de inputs. Sem isto, não é uma app de nutrição completa.**

1. **REGISTO DE REFEIÇÕES** ⭐⭐⭐
   - Cada refeição (PA, almoço, snack, jantar)
   - Foto da refeição (pedido explícito)
   - Componentes (proteína, carbo, gordura, vegetais)
   - Hora · contexto (em casa, fora, viagem)
   - Sentir após refeição (saciedade, energia, gases, etc.)

2. **CALORIAS + MACROS** ⭐⭐⭐
   - Calorias totais do dia
   - Macros (proteína g, carbo g, gordura g)
   - Comparação vs target diário (calculado pelo TMB + objectivo)
   - Histórico, médias semanais
   - Base de dados de alimentos (Mozambique-friendly · matapa, xima, frango grelhado, etc.)

3. **PLANO ALIMENTAR SEMANAL** ⭐⭐⭐
   - Construtor de plano semanal de refeições
   - Templates por fase (indução, transição, estabilização, manutenção)
   - Lista de compras gerada automaticamente do plano
   - Plano de treino integrado (não só referência estática)
   - Plano de sono e descanso

4. **REGISTO POR FOTOS** ⭐⭐ (já anotado antes, agora prioridade alta)
   - Comida (com análise de Claude Vision para macros estimados?)
   - Peso (foto da balança)
   - Exercício (forma, partilha)
   - Coach (mostrar sintoma, refeição, etc.)

5. **APPLE WATCH / WEARABLE** ⭐⭐
   - Sleep, heart rate, steps, workouts
   - Health Connect API para Android

### Tier 1 · Alto impacto (DEPOIS DOS BÁSICOS)
6. **Fix QuickTools** — investigar porque não renderiza no Hoje
7. **Voz no Desabafo** — Web Speech API
8. **Coach voice mode** — TTS da abertura diária
9. **Marcos/milestones** — Dias 7, 14, 30, 60 com selo logo-03
10. **Ramadão mode** — janela alimentar adaptada
11. **Notificações Web Push reais** — funcionar com app fechada

## ⚠️ OBSERVAÇÃO IMPORTANTE DA VIVIANNE

> "Não vejo nenhuma ferramenta de registo de refeições, nada sobre calorias, nenhum plano. Isso é o básico."

A app actual TEM:
- ✅ Tracking de outcomes: peso, cintura, jejum, ciclo, álcool, sono, energia, humor, âncoras
- ✅ Análise: scanner, padrões, coach IA com memória persistente
- ✅ Suporte: âncoras, mantras, definições, paletas

A app actual NÃO TEM:
- ❌ Registo de refeições (o que comeu, quando, fotos)
- ❌ Cálculo de calorias e macros
- ❌ Plano alimentar interactivo (só `/receitas` estático de referência)
- ❌ Plano de treino editável (só `/treino` estático de referência)
- ❌ Lista de compras gerada do plano
- ❌ TMB + comparação com objectivos diários
- ❌ Base de dados de alimentos (Mozambique-friendly)

**Próxima sessão deve construir estas ferramentas de input antes de adicionar mais features de análise.**

### Tier 2 · Profundidade analítica
8. **Energia budget** — vista visual do que dá/tira energia
9. **Mood weather** — humor da semana como tempo (sol/chuva)
10. **Anomaly chat** — quando detecta anomalia, coach pergunta directamente
11. **"Substituir o copo"** — sugere alternativa baseada no gatilho
12. **Calendário mensal** — vista mês com ícones por dia
13. **Comparação semana actual vs anterior** — todas métricas

### Tier 3 · Vida real
14. **Modo viagem** — regras adaptadas
15. **Modo SOS** — botão "estou no limite" → 3 min calm
16. **Plano de comida builder** — montas refeições, calcula macros
17. **Workout timer** — sets, reps, descansos
18. **Receitas extra Maputo** — matapa, xima keto

### Tier 4 · Integração
19. **Apple Health** — importar sono, passos
20. **Lembretes Web Push verdadeiros** — funcionam com app fechada
21. **Print/PDF** — relatório quinzenal

### Tier 5 · Editorial
22. **Citações Sete Véus** — uma por semana
23. **Ritual Dia 60** — graduação animada com selo
24. **Modo livro** — vista cronológica do diário

---

## Migração SQL pendente (aplicar uma vez no Supabase)

```sql
-- Adicionar coluna cintura à tabela peso
ALTER TABLE fenixfit_peso ADD COLUMN IF NOT EXISTS cintura numeric(5,1);

-- Coach chat persistente (memória da coach)
CREATE TABLE IF NOT EXISTS fenixfit_coach_chat (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  contexto_resumo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fenixfit_coach_chat_user_ts ON fenixfit_coach_chat (user_id, timestamp DESC);
ALTER TABLE fenixfit_coach_chat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach_chat_owner" ON fenixfit_coach_chat FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

E garantir que estas tabelas existem (já estão em `apps/reset/supabase/schema.sql`):
- fenixfit_peso, fenixfit_jejum, fenixfit_ciclo, fenixfit_profile (e os 5 antigos)

---

## Variáveis de ambiente (Cloudflare Pages)

Em **Settings → Environment variables**, em Production e Preview:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
ANTHROPIC_API_KEY=sk-ant-...
NODE_VERSION=20
```

---

## Build settings (Cloudflare)

- **Build command**: `npm run build:cf`
- **Build output**: `.vercel/output/static`
- **Root directory**: `apps/reset`
- **Production branch**: `claude/monorepo-lifestyle-app-ZAA2E`
- **Compatibility flag**: `nodejs_compat` (em Production e Preview)

O script `build:cf` faz: `next build && cp -r out/. .vercel/output/static/`

---

## Tom de voz · regras

- Português europeu informal, acentos sempre, tutear
- Frases curtas. Densas. Sem "tu consegues" ou "és incrível".
- Sem emojis. Sem moralização. Sem julgamento.
- Voz de espelho calmo. Inspiração: autora dos Sete Véus (densa, contemplativa).
- Sempre que aplicável, terminar com pergunta concreta (especialmente Coach).

---

## Como continuar em nova sessão

1. **Diz ao novo agente**: trabalhar na branch `claude/monorepo-lifestyle-app-ZAA2E`
2. **Lê este ficheiro**: `apps/reset/CONTEXT.md` (para contexto completo)
3. **Lê o CLAUDE.md raiz**: para regras gerais do projeto Sete Ecos
4. **Cada commit** triggera redeploy automático no Cloudflare (~2-3 min)

Se o novo agente criar branch nova:
- Vai a Cloudflare → Settings → Builds & deployments
- Muda **Production branch** para o novo nome
- Save → próximo deploy é dessa branch

---

## URLs úteis

- App: `https://sete-ecos-pwa.pages.dev/`
- Kill switch: `https://sete-ecos-pwa.pages.dev/limpar`
- Supabase: `https://app.supabase.com`
- Cloudflare Pages: `https://dash.cloudflare.com/?to=/:account/pages`
- Anthropic Console: `https://console.anthropic.com`
- Repo: `https://github.com/vivnasc/sete-ecos-pwa`
