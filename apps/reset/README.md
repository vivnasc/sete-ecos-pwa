# Reset · 60 dias

Companheira pessoal de jornada. App PWA moderna, editorial, sincronizada entre dispositivos via Supabase, com leituras semanais por Claude.

**11 maio – 9 julho 2026**

---

## Funcionalidades

### Hoje (`/`)
- "SmartNow" — bloco contextual por hora do dia (madrugada, PA, almoço, gatilho do copo, encerrar dia, etc.)
- Mantra editorial rotativo
- Checklist das 7 âncoras com toggle táctil
- Métricas grandes: constância, dias sem álcool, variação cintura, sono médio

### Diário (`/diario`)
- Strip horizontal de 60 dias com indicador de cumprimento
- Por dia: âncoras, sono, caminhada, energia 1–5, humor 1–5, notas

### Sinais (`/metricas`)
- Heatmap 60 dias estilo GitHub contributions
- Gráficos SVG: cintura, peso, sono (21 dias)
- Detecção automática de **padrões locais**:
  - sono vs energia (correlação)
  - álcool vs sono
  - gatilho principal
  - dia da semana mais difícil
  - tendência de humor
  - consistência de âncoras

### Caderno antes do copo (`/alcool`)
- Fluxo: emoção → gatilho → respira → decide
- Padrões dos últimos 30 registos
- Histórico marcado (verde = não bebeu, terracota = bebeu)

### Mais (`/mais`)
- Medidas, Desabafo, Insights, Comer, Treino, Definições, Sair

### Definições (`/definicoes`)
- Perfil (nome, horários)
- Tema (claro · escuro · sistema)
- Lembretes locais (4 horários personalizáveis com toggles)
- Estado de sincronização Supabase
- Backup local (export/import JSON)

### Insights (`/insights`)
- Análise semanal gerada por Claude Sonnet 4.6
- Prompt caching para eficiência
- Cache local da última leitura

---

## Stack

| | |
|--|--|
| **Framework** | Next.js 14 App Router + TypeScript |
| **Styling** | Tailwind CSS · Fraunces (serif) + Inter (sans) |
| **Storage** | Supabase (primário, sincronizado) + localStorage (cache offline) |
| **Auth** | Supabase email + password · RLS por user_id |
| **AI** | Anthropic SDK · Claude Sonnet 4.6 · prompt caching |
| **PWA** | Manifest + service worker offline-first |
| **Theme** | Light · Dark · System (detection automática) |
| **Deploy** | Netlify |

---

## Setup

### 1. Supabase

1. Cria projecto em [supabase.com](https://supabase.com)
2. SQL editor → cola o ficheiro `supabase/schema.sql` → run
3. Authentication → enable email provider · disable email confirmation se quiseres entrar logo
4. Settings → API → copia URL e anon key

### 2. Variáveis Netlify

Em **Site settings → Environment variables**:

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Deploy Netlify

1. **Add new site → Import existing project**
2. Conecta repo `vivnasc/sete-ecos-pwa`
3. Branch: `claude/monorepo-lifestyle-app-ZAA2E`
4. Tudo o resto está em `apps/reset/netlify.toml` (base, build, publish, plugin Next.js)
5. Deploy

### 4. Primeira utilização

1. Abre o site → cria conta (email + password)
2. Onboarding (5 passos): nome, sexo, peso/cintura iniciais, horários, gatilhos do álcool
3. Dashboard contextual abre

### 5. Adicionar ao ecrã principal

- **iOS**: Safari → partilhar → "Adicionar ao Ecrã Principal" (prompt aparece automático)
- **Android**: Chrome → menu → "Instalar aplicação"

---

## Princípios de design

1. **Editorial, não infantil.** Tipografia Fraunces. Hairlines em vez de fills pesados. Tabular numbers nos dados.
2. **5 minutos por dia.** Cada acção em 1–2 toques. FAB para registo rápido.
3. **Espelho calmo.** Tom factual. Sem "tu consegues". Sem moralização. Sem emojis.
4. **Mobile-first absoluto.** Cada layout testado em ecrã pequeno. Áreas tácteis ≥44px.
5. **Offline first.** localStorage como cache. Supabase sincroniza em background.

---

## Estrutura

```
apps/reset/
├── app/
│   ├── layout.tsx          # ThemeProvider + AuthGate + OnboardingGate + FAB
│   ├── page.tsx            # Hoje · SmartNow + âncoras + métricas
│   ├── login/
│   ├── diario/
│   ├── medidas/
│   ├── metricas/           # Sinais · heatmap + charts + padrões
│   ├── alcool/
│   ├── desabafo/
│   ├── receitas/
│   ├── treino/
│   ├── insights/
│   ├── definicoes/
│   ├── mais/
│   └── api/insights/       # POST · Claude com prompt caching
├── components/
│   ├── AuthGate.tsx        # Supabase session + redirect
│   ├── OnboardingGate.tsx  # First-run flow 5 passos
│   ├── ThemeProvider.tsx   # Light/dark/system
│   ├── SmartNow.tsx        # Time-aware home block
│   ├── Heatmap.tsx         # 60-day grid
│   ├── TrendChart.tsx      # SVG line chart
│   ├── AnchorChecklist.tsx
│   ├── QuickLog.tsx        # FAB
│   ├── InstallPrompt.tsx   # iOS A2HS
│   ├── Navigation.tsx      # 5 tabs
│   ├── Mantra.tsx
│   └── RegisterSW.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── sync.ts             # Hidratação + sync por entidade
│   ├── storage.ts          # localStorage primary + sync triggers
│   ├── profile.ts
│   ├── patterns.ts         # Detecção local de correlações
│   ├── notifications.ts    # Lembretes locais
│   ├── data.ts             # Constantes (mantras, refeições, treino)
│   ├── dates.ts
│   └── utils.ts
├── public/
│   ├── icon.svg
│   ├── manifest.json
│   └── sw.js
└── supabase/
    └── schema.sql          # 7 tabelas + RLS + índices + triggers
```

---

## Schema Supabase

7 tabelas, todas com RLS por `auth.uid() = user_id`:

| Tabela | Conteúdo |
|--------|----------|
| `reset_profile` | nome, sexo, horários, gatilhos, onboarding |
| `reset_dias` | âncoras (jsonb), sono, energia, humor, notas |
| `reset_alcool` | timestamp, emoção, gatilho, decidiu beber |
| `reset_medidas` | cintura, ancas, coxa, braço, peso, fotos |
| `reset_desabafo` | texto, emoção, timestamp |
| `reset_insights` | leitura semanal cache |
| `reset_lembretes` | config jsonb |

Bucket de storage `reset-fotos` opcional para fotos de medidas (criar manualmente se quiseres).

---

## Tom de voz

**Espelho calmo.** Não personal trainer entusiasmado.

✗ "Tu consegues!"
✗ "És incrível!"
✗ "Não desistas!"
✓ "estás cansada, não falhada."
✓ "subtracção, não adição."
✓ "primeiro escreves. depois decides."

Português europeu informal, tutear, sem emojis, mínimo de exclamações, frases curtas.
