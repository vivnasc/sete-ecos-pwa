# FénixFit · 60 dias

Companheira pessoal de jornada. PWA editorial, sincronizada entre dispositivos via Supabase, leituras semanais por Claude.

---

## Funcionalidades

### Hoje (`/`)
- **SmartNow** — bloco contextual por hora do dia (madrugada → treino → PA → almoço → última refeição → caderno → encerrar dia → noite)
- Mantra editorial rotativo
- Checklist das 7 âncoras
- Métricas grandes: constância, dias sem álcool, variação cintura, sono médio

### Diário (`/diario`)
- Strip de 60 dias com indicador de cumprimento
- Por dia: âncoras, sono, caminhada, energia 1–5, humor 1–5, notas

### Sinais (`/metricas`)
- Heatmap 60 dias estilo contributions
- Gráficos SVG: cintura, peso, sono
- Detecção automática de padrões: sono↔energia, álcool↔sono, gatilho principal, dia mais difícil, tendência humor, consistência

### Caderno antes do copo (`/alcool`)
- Fluxo: emoção → gatilho → respira → decides
- Padrões dos últimos 30 registos

### Mais (`/mais`)
- Medidas, Desabafo, Insights, Comer, Treino, Definições

### Definições (`/definicoes`)
- Perfil, tema (claro · escuro · sistema), lembretes locais, sync Supabase, backup local

### Insights (`/insights`)
- Análise semanal por Claude Sonnet 4.6 com prompt caching
- Edge runtime · funciona em Cloudflare Pages

---

## Stack

| | |
|--|--|
| **Framework** | Next.js 14 App Router + TypeScript |
| **Styling** | Tailwind · Fraunces (serif variável) + Inter |
| **Storage** | Supabase (primário sincronizado) + localStorage (cache offline) |
| **Auth** | Supabase email + password · RLS |
| **AI** | Claude Sonnet 4.6 · fetch directo (edge-compatible) · prompt caching |
| **PWA** | Manifest + service worker offline-first |
| **Theme** | Light · Dark · System |
| **Deploy** | Cloudflare Pages (recomendado) ou Netlify ou Vercel |

---

## Setup

### 1. Supabase

1. Cria projecto em [supabase.com](https://supabase.com)
2. SQL editor → cola `supabase/schema.sql` → Run
3. Authentication → enable email · disable email confirmation se quiseres entrar logo
4. Settings → API → copia URL e anon key

### 2. Cloudflare Pages (recomendado)

1. Cria conta em [cloudflare.com](https://cloudflare.com) com Gmail (sem GitHub necessário)
2. Workers & Pages → Create → Pages → Connect to Git **OU** Direct upload
3. Se Git: conectar este repo → branch `claude/monorepo-lifestyle-app-ZAA2E`
4. **Build settings**:
   - Framework preset: Next.js
   - Build command: `npm run build:cf`
   - Build output directory: `.vercel/output/static`
   - Root directory: `apps/reset`
   - Node.js version: `20`
5. **Environment variables** (Settings → Environment variables):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
   NODE_VERSION=20
   ```
6. Compatibility flags: `nodejs_compat` (Settings → Functions → Compatibility flags · production + preview)
7. Deploy. Domínio inicial: `fenixfit.pages.dev` ou similar.

### 3. Direct upload (sem Git, se preferires)

Se queres deploy sem ligar ao GitHub:
```
cd apps/reset
npm install
npm run build:cf
# Faz upload da pasta .vercel/output/static no dashboard do Cloudflare
```

### 4. Adicionar ao ecrã principal

- **iOS**: Safari → partilhar → "Adicionar ao Ecrã Principal" (prompt aparece automático)
- **Android**: Chrome → menu → "Instalar aplicação"

---

## Princípios

1. **Editorial, não infantil.** Tipografia Fraunces. Hairlines. Tabular nums.
2. **5 minutos por dia.** Cada acção em 1–2 toques. FAB para registo rápido.
3. **Espelho calmo.** Sem "tu consegues". Sem moralização. Sem emojis.
4. **Mobile-first.** Áreas tácteis ≥44px.
5. **Offline-first.** localStorage cache + Supabase sync background.

---

## Schema Supabase

7 tabelas, todas com RLS por `auth.uid() = user_id`:

- `fenixfit_profile` — nome, sexo, horários, gatilhos, onboarding
- `fenixfit_dias` — âncoras (jsonb), sono, energia, humor, notas
- `fenixfit_alcool` — timestamp, emoção, gatilho, decidiu beber
- `fenixfit_medidas` — cintura, ancas, coxa, braço, peso, fotos
- `fenixfit_desabafo` — texto, emoção
- `fenixfit_insights` — leitura semanal cache
- `fenixfit_lembretes` — config jsonb
