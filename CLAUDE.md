# CLAUDE.md - AI Assistant Guide for SETE ECOS PWA

## Session Instructions (MANDATORY)

**The owner (Vivianne) works exclusively via Claude Code on the web.** Every session must follow these rules:

1. **Language**: Communicate in Portuguese (informal). Vivianne writes informally — interpret typos and abbreviations naturally.
2. **Never break existing functionality.** Before changing any file, understand what it does. Don't touch layout, PDF generation, or plan generation logic unless explicitly asked.
3. **Always build-check** (`npm run build`) after code changes before committing.
4. **Database schema matters.** The Supabase tables have specific columns defined in `supabase/vitalis_tables.sql` and migration files. **Never** try to write to columns that don't exist. Check the schema first.
5. **Key table column reference:**
   - `vitalis_clients`: id, user_id, status, subscription_status, data_inicio, data_fim, fase_actual, duracao_programa, pacote, objectivo_principal, peso_inicial, peso_actual, peso_meta, imc_inicial, imc_actual, emocao_dominante, prontidao_1a10, payment_*, trial_started, subscription_updated, created_at, updated_at
   - `vitalis_intake`: All personal data (nome, email, idade, sexo, altura_cm, peso_actual, peso_meta, cintura_cm, anca_cm, restricoes_alimentares, abordagem_preferida, etc.)
   - `users`: id, auth_id, email, nome, created_at
6. **Dietary restrictions** are in `vitalis_intake.restricoes_alimentares` and filtered by `src/lib/vitalis/restricoesAlimentares.js`.
7. **Plan generation** lives in `src/lib/vitalis/planoGenerator.js` — changes here affect all new plans. Existing plans in DB are NOT affected by display-level changes.
8. **Gender-adaptive text** is mandatory — see Gender Sensitivity section below.

## Project Overview

**SETE ECOS** is a Portuguese feminine transformation system (Sistema de Transmutacao Feminina) built as a Progressive Web Application. The platform consists of 7 "Ecos" (Echoes), each addressing different aspects of feminine wellness based on chakra principles.

**Owner**: Vivianne dos Santos
**Primary Language**: Portuguese (Portugal/Mozambique)
**Target Market**: Women seeking holistic wellness, primarily in Mozambique and Portugal
**Version**: 2.0 (Premium Platform Upgrade — Feb 2026)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3 + Vite 5 |
| Routing | React Router DOM 6.22 |
| Backend/Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS v4 (build-time via PostCSS) + CSS Variables |
| Charts | Recharts 2.12 |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Vitest + React Testing Library |
| i18n | Custom lightweight framework (pt, en, fr) |
| PDF Generation | Puppeteer (serverless via Vercel) |
| Deployment | Vercel |

## Architecture

```
sete-ecos-pwa/
├── api/                        # Vercel serverless functions
│   ├── gerar-pdf.js            # PDF generation endpoint
│   ├── enviar-email.js         # Email service
│   ├── tarefas-agendadas.js    # Daily scheduled tasks (9 AM)
│   └── whatsapp-*.js           # WhatsApp integration
├── public/
│   ├── logos/                  # Brand assets for all 7 Ecos
│   ├── manifest.json           # PWA manifest (overridden by vite config)
│   └── *.pdf                   # Legal documents (Privacy, Terms)
├── src/
│   ├── App.jsx                 # Main routing with lazy loading + ErrorBoundary
│   ├── main.jsx                # React entry point
│   ├── components/
│   │   ├── Auth.jsx            # Generic authentication
│   │   ├── ErrorBoundary.jsx   # Error boundary with fallback UI
│   │   ├── Navigation.jsx      # Bottom navigation (ARIA labels, accessible)
│   │   ├── SkipLink.jsx        # Accessibility skip-to-content link
│   │   ├── SustainabilityBadge.jsx # Green coding badge component
│   │   ├── vitalis/            # Vitalis module (31 components)
│   │   ├── aurea/              # Aurea module (19 components)
│   │   └── comunidade/         # Community module (15 components)
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Auth + module access state
│   │   ├── I18nContext.jsx     # Internationalization context
│   │   └── ThemeContext.jsx    # Dark/light mode
│   ├── lib/
│   │   ├── supabase.js         # Supabase client
│   │   ├── subscriptions.js    # Vitalis subscription management
│   │   ├── lumina-leituras.js  # Lumina reading patterns (23 patterns)
│   │   ├── i18n.js             # Translation system (pt, en, fr)
│   │   ├── coach.js            # Coach access control
│   │   ├── comunidade.js       # Community social logic
│   │   ├── validacao.js        # Input validation
│   │   ├── aurea/              # Aurea-specific logic
│   │   └── vitalis/            # Vitalis-specific logic
│   ├── pages/                  # 14 page components
│   ├── styles/
│   │   └── global.css          # Tailwind import, CSS vars, a11y, dark mode
│   ├── test/
│   │   └── setup.js            # Vitest setup (jest-dom)
│   └── utils/
│       ├── genero.js           # Gender-adaptive text system
│       ├── notifications.js    # Browser notification helpers
│       └── ramadao.js          # Ramadan date handling
├── index.html                  # App entry with structured data (JSON-LD)
├── postcss.config.js           # PostCSS with Tailwind v4
├── vite.config.js              # Vite + PWA + code splitting
├── vitest.config.js            # Test configuration
└── package.json
```

**Total components**: 83 JSX files across 3 active modules + community

## The 7 Ecos (Modules)

| Eco | Chakra | Focus | Status | Components |
|-----|--------|-------|--------|------------|
| **VITALIS** | Muladhara (Root) | Body/Nutrition | Active (Paid) | 31 |
| **AUREA** | — | Worth/Presence | Built (Hidden) | 19 |
| **SERENA** | Svadhisthana | Emotion | Planned | 0 |
| **IGNIS** | Manipura | Will/Focus | Planned | 0 |
| **VENTIS** | Anahata | Energy/Rhythm | Planned | 0 |
| **ECOA** | Vishuddha | Expression/Voice | Planned | 0 |
| **LUMINA** | Ajna | Vision/Diagnosis | Active (Free) | 1 |
| **IMAGO** | Sahasrara | Identity | Planned | 0 |
| **AURORA** | — | Final Integration | Future | 0 |
| **COMUNIDADE** | — | Social/Self-knowledge | Active | 15 |

## Key Architectural Patterns (v2.0)

### Code Splitting (Lazy Loading)
All modules load lazily via `React.lazy()`. Only Home, Login, and ComingSoon load eagerly.
```jsx
const DashboardVitalis = lazy(() => import('./components/vitalis/DashboardVitalis'))
// Used with <Suspense fallback={<LoadingFallback />}>
```

### Protected Route Helpers
```jsx
<VitalisRoute><DashboardVitalis /></VitalisRoute>  // Auth + subscription guard
<AureaRoute><DashboardAurea /></AureaRoute>         // Auth + Aurea guard
<AuthRoute from="/lumina"><Lumina /></AuthRoute>     // Auth only
```

### Error Boundary
Wraps the entire app. Shows Portuguese error UI with retry button.

### Internationalization (i18n)
```jsx
import { useI18n } from '../contexts/I18nContext'
const { t, locale, setLocale } = useI18n()
t('nav.home') // "Inicio" (pt) | "Home" (en) | "Accueil" (fr)
```

### Accessibility (WCAG 2.2 AA)
- Skip-to-content link in index.html
- `<main id="main-content" role="main">` wrapper
- ARIA labels on all navigation elements
- `aria-current="page"` on active nav items
- `aria-hidden="true"` on decorative elements
- Focus-visible styles (keyboard navigation)
- Reduced motion support (`prefers-reduced-motion`)
- High contrast support (`prefers-contrast`)
- Print styles

## Development

### Setup
```bash
npm install

# Create .env file
VITE_SUPABASE_URL=https://vvvdtogvlutrybultffx.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id  # Optional
VITE_PAYPAL_MODE=sandbox  # or 'live'
```

### Commands
```bash
npm run dev           # Start dev server on port 3000
npm run build         # Production build with code splitting
npm run preview       # Preview production build
npm run test          # Run tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Build Output (optimized)
| Chunk | Size (gzip) | Strategy |
|-------|-------------|----------|
| vendor-react | ~53KB | Long-term cache |
| vendor-supabase | ~44KB | Long-term cache |
| vendor-charts | ~51KB | Loaded only with reports |
| index (app shell) | ~23KB | App entry |
| Per-module chunks | 5-17KB each | Lazy loaded on navigation |

### Styling
1. **Tailwind CSS v4** via build-time PostCSS compilation (NOT CDN)
2. **CSS Variables** in `global.css` for theming
3. **Dark mode** via `.dark` class on `:root`
4. **Design tokens**: `--eco-*-*`, `--lumina-*`, `--vitalis-*`

### Testing
- **Framework**: Vitest + React Testing Library + jest-dom
- **Config**: `vitest.config.js` with jsdom environment
- **Convention**: `ComponentName.test.jsx` alongside component or in `src/lib/*.test.js`

### PWA Configuration
- Auto-update registration
- Manifest: Sete Ecos branded (categories: health, lifestyle, wellness, fitness)
- Start URL: `/` (universal entry)
- Shortcuts: Lumina, Vitalis dashboard
- Cache strategies:
  - Images: CacheFirst (30 days)
  - Fonts: CacheFirst (1 year)
  - Google Fonts: StaleWhileRevalidate
  - Supabase API: NetworkFirst (24h, 10s timeout)
- Offline fallback: `/index.html`

## Authentication & Authorization

### Auth Flow
1. Supabase Auth handles login/registration
2. `AuthContext.jsx` syncs session, creates user record via UPSERT
3. `checkModuleAccess()` queries subscription tables per module
4. Safety timeout (3s) prevents infinite loading

### Subscription System
**Vitalis** (`src/lib/subscriptions.js`):
- Monthly: 2,500 MZN | Semestral: 12,500 MZN | Annual: 21,000 MZN

**Aurea** (`src/lib/aurea/subscriptions.js`):
- Monthly: 975 MZN | Semestral: 5,265 MZN | Annual: 9,945 MZN

**Statuses**: tester, trial, active, pending, expired, cancelled

### Admin Access
Coach dashboard at `/coach` restricted to emails in `src/lib/coach.js`

## Sustainability & Green Coding

- Build-time CSS compilation (no CDN runtime)
- Code splitting reduces initial load by 96%
- Aggressive caching strategies for static assets
- Lazy loading of all non-critical modules
- `SustainabilityBadge` component shows eco-digital commitment

## Common Tasks

1. **Adding new Vitalis feature**: Create in `src/components/vitalis/`, add lazy import in `App.jsx`, wrap with `<VitalisRoute>`
2. **Adding translations**: Update `src/lib/i18n.js` translations object
3. **Adding new Eco module**: Create folder in `src/components/`, add lazy routes, create AccessGuard
4. **Running tests**: `npm run test` or `npm run test:watch`
5. **Checking accessibility**: Review ARIA labels, focus styles, color contrast

## Security Notes

- `.env` files gitignored
- Supabase RLS should be configured for production
- Coach emails in `src/lib/coach.js` with env var fallback
- PayPal integration supports sandbox/live modes
- Error boundaries prevent crash information leakage

## Gender Sensitivity (MANDATORY)

**All user-facing Portuguese text MUST be gender-adaptive.** The platform serves both men and women. Never hardcode feminine-only text like "Bem-vinda", "querida", "perfeita", etc.

### Utility: `src/utils/genero.js`

Two functions depending on context:

```jsx
// 1. Client-side components (reads sexo from localStorage)
import { g } from '../utils/genero'
g('Bem-vindo', 'Bem-vinda')     // auto-adapts
g('querido', 'querida')
g('perfeito', 'perfeita')

// 2. Coach dashboard, emails, API (explicit sexo parameter)
import { gx } from '../utils/genero'
gx(intake?.sexo, 'Bem-vindo', 'Bem-vinda')
gx(client.sexo, 'activo', 'activa')
```

### Rules

1. **NEVER** write hardcoded gendered Portuguese words in user-facing text. Always use `g()` or `gx()`.
2. **Client-side components** (DashboardVitalis, EspacoRetorno, etc.): use `g(masc, fem)` — reads from localStorage.
3. **Coach dashboard** (CoachClienteDetalhe, CoachDashboard): use `gx(sexo, masc, fem)` with `intake?.sexo` or `client.sexo`.
4. **Email templates** (`api/enviar-email.js`): use `dados.sexo` to build gender helpers at template level.
5. **API endpoints**: pass `sexo` in data payloads when sending emails or messages.
6. **Default is feminine** (majority of users), but code must support both.

### Common gendered words reference

| Masculino | Feminino | Usage |
|-----------|----------|-------|
| Bem-vindo | Bem-vinda | Greetings |
| querido | querida | Terms of endearment |
| obrigado | obrigada | Thanks |
| perfeito | perfeita | Motivational |
| cansado | cansada | State descriptions |
| motivado | motivada | State descriptions |
| activo | activa | Status labels |
| inactivo | inactiva | Status labels |
| conectado | conectada | State descriptions |
| sozinho | sozinha | State descriptions |
| inscrito | inscrita | Registration |
| preparado | preparada | Readiness |
