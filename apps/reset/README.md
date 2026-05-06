# Reset · 60 dias

Companheira pessoal de jornada · 11 maio – 9 julho 2026.

App pessoal da Vivianne. Funciona offline (PWA), guarda tudo em
`localStorage` por defeito. Insights semanais via Claude API (Sonnet 4.6).

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- localStorage para dados (sem auth, single user, single device)
- Anthropic SDK para insights semanais
- PWA (manifest + service worker mínimo)
- Deploy: Netlify

## Páginas

| Rota | O que faz |
|------|-----------|
| `/` | Dashboard · âncoras de hoje, métricas, mantra, treino |
| `/diario` | Strip de 60 dias · âncoras + sono/energia/humor por dia |
| `/medidas` | Medições quinzenais (cintura, ancas, coxa, braço, peso) |
| `/alcool` | "Caderno antes do copo" · padrões nos gatilhos |
| `/receitas` | Plano keto + lista de compras |
| `/treino` | Plano semanal + regras |
| `/desabafo` | Diário privado · sem respostas, sem chat |
| `/insights` | Análise semanal por IA · padrões nos dados |

## Setup local

```bash
cd apps/reset
npm install
cp .env.example .env.local
# editar .env.local com a tua ANTHROPIC_API_KEY
npm run dev
```

App em `http://localhost:3001`.

## Deploy Netlify

1. Em Netlify, **Add new site → Import existing project**
2. Conectar este repo (`vivnasc/sete-ecos-pwa`)
3. **Branch**: `claude/monorepo-lifestyle-app-ZAA2E` (ou `main` depois de merge)
4. **Base directory**: `apps/reset`
5. **Build command**: `npm install && npm run build` (já em `netlify.toml`)
6. **Publish directory**: `apps/reset/.next` (já em `netlify.toml`)
7. **Environment variables**:
   - `ANTHROPIC_API_KEY` (obrigatório para `/insights`)
   - `NEXT_PUBLIC_RESET_START_DATE=2026-05-11` (opcional, hardcoded no `lib/dates.ts`)
8. Deploy.

O `netlify.toml` já tem o plugin `@netlify/plugin-nextjs` — Netlify
detecta automaticamente Next.js 14 com App Router.

## Tom de voz

Espelho calmo. Não personal trainer entusiasmado. Frases curtas. Sem
emojis. Sem moralização. Português europeu, tutear.

## Backup dos dados

Os dados ficam em `localStorage` do browser. Para fazer backup:

```js
// Na consola do browser:
copy(JSON.stringify({
  dias: JSON.parse(localStorage.getItem('reset:dias') || '{}'),
  alcool: JSON.parse(localStorage.getItem('reset:alcool') || '[]'),
  medidas: JSON.parse(localStorage.getItem('reset:medidas') || '[]'),
  desabafo: JSON.parse(localStorage.getItem('reset:desabafo') || '[]')
}, null, 2))
```

(Versão futura terá UI de export/import.)

## Princípios

1. App para 5 minutos por dia. Não 30.
2. Tom factual. Não tóxico.
3. Mobile-first. Sempre.
4. Sem julgamento. Sem moralização.
5. Os dados são teus. Fora do servidor.
