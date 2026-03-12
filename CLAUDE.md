# CLAUDE.md - AI Assistant Guide for SETE ECOS PWA

## Session Instructions (MANDATORY)

**The owner (Vivianne) works exclusively via Claude Code on the web.** She does NOT have a local development environment — no local terminal, no local Node.js, no local IDE. All development, testing, builds, git operations, and file editing happen inside the Claude Code web session. Never suggest local commands, local installs, or "run this on your machine" — everything must be done here. Every session must follow these rules:

1. **Language**: Communicate in Portuguese (informal). Vivianne writes informally — interpret typos and abbreviations naturally.
2. **Never break existing functionality.** Before changing any file, understand what it does. Don't touch layout, PDF generation, or plan generation logic unless explicitly asked.
3. **Always build-check** (`npm run build`) after code changes before committing.
4. **Database schema matters.** The Supabase tables have specific columns defined in `supabase/*.sql` and `database/*.sql`. **Never** try to write to columns that don't exist. Check the schema first.
5. **Dietary restrictions** are in `vitalis_intake.restricoes_alimentares` and filtered by `src/lib/vitalis/restricoesAlimentares.js`.
6. **Plan generation** lives in `src/lib/vitalis/planoGenerator.js` — changes here affect all new plans. Existing plans in DB are NOT affected by display-level changes.
7. **Gender-adaptive text** is mandatory — see Gender Sensitivity section below.

## Project Overview

**SETE ECOS** is a Portuguese holistic transformation system (Sistema de Transmutação Integral) built as a Progressive Web Application. The platform consists of 7 "Ecos" (Echoes), each addressing a different dimension of wellness inspired by chakra principles, plus a free diagnostic module (Lumina), a community space (Comunidade), and a final integration module (Aurora).

**Owner**: Vivianne Saraiva (Coach de Nutrição e Bem-estar)
**Primary Language**: Portuguese (Portugal/Mozambique)
**Target Market**: People seeking holistic wellness, primarily in Mozambique and Portugal
**Production URL**: https://app.seteecos.com
**Version**: 2.0 (Premium Platform Upgrade — Feb 2026)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3 + Vite 5 |
| Routing | React Router DOM 6.22 |
| Backend/Auth | Supabase (PostgreSQL + Auth + RLS) |
| Styling | Tailwind CSS v4 (build-time via PostCSS) + CSS Variables |
| Animations | Framer Motion 12.34 |
| Charts | Recharts 2.12 |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Vitest 4 + React Testing Library 16 + jest-dom |
| i18n | Custom lightweight framework (pt, en, fr) |
| PDF Generation | Puppeteer (serverless via Vercel, 1GB memory) |
| Email | Resend API (8 template types) |
| WhatsApp | Meta Cloud API (templates + webhook + chatbot) |
| Social Media | Meta Graph API v21.0 (Instagram + Facebook) |
| Push Notifications | Web Push API + VAPID keys |
| Payments | PayPal (sandbox/live) + M-Pesa (manual) |
| Deployment | Vercel (Hobby plan, 9 cron jobs) |
| Fonts | Playfair Display (serif) + Inter (sans-serif) |

## Architecture

```
sete-ecos-pwa/
├── api/                            # Vercel serverless functions (11 endpoints)
│   ├── coach.js                    # Coach dashboard backend (1247 lines)
│   ├── cron.js                     # Central cron dispatcher (8 tasks)
│   ├── diagnostico.js              # User account diagnostic
│   ├── enviar-email.js             # Email via Resend (8 templates)
│   ├── gerar-pdf.js                # PDF via Puppeteer (1GB memory)
│   ├── gerar-plano-manual.js       # Manual plan generation (secret-protected)
│   ├── regenerar-plano-emergencia.js # Emergency plan regen
│   ├── facebook-publish.js         # Facebook publishing (Graph API v21)
│   ├── instagram-publish.js        # Instagram publishing (Graph API v21)
│   ├── whatsapp-twilio.js          # WhatsApp API consolidated (templates, diagnostics)
│   ├── whatsapp-webhook.js         # WhatsApp receiver (dedup, rate limit, chatbot)
│   └── _lib/                       # Shared serverless utilities (13 files)
│       ├── chatbot-respostas.js    # Chatbot response logic (28 keys, 827 lines)
│       ├── chatbot-log.js          # Non-blocking chatbot logging
│       ├── tarefas-agendadas.js    # Daily tasks: reminders, marcos, winback (1022 lines)
│       ├── email-sequencia.js      # Email nurture sequence (day 0-30)
│       ├── whatsapp-broadcast.js   # WhatsApp broadcast + 13 Meta templates
│       ├── wa-sequencia-cron.js    # WhatsApp nurture mirror (daily 11h)
│       ├── wa-leads-cron.js        # Weekly lead follow-up (Monday 10h)
│       ├── trial-expiring-emails.js # Trial expiry emails (-3, -1, 0, +3 days)
│       ├── broadcast-interessados.js # Broadcast to leads (catálogo, promo, etc.)
│       ├── instagram-schedule.js   # Social media scheduler
│       ├── push-lembretes.js       # Push notifications 3x daily
│       ├── fix-clients-status.js   # Data maintenance migration
│       └── test-intake-flow.js     # Integration test for intake→plan
├── database/                       # Community SQL schemas
│   ├── comunidade-social.sql       # Community tables (v1)
│   └── comunidade-v2.sql           # Community tables (v2: sussurros, fogueira)
├── supabase/                       # Database schemas (per eco)
│   ├── vitalis_tables.sql
│   ├── aurea_tables.sql
│   ├── serena_tables.sql
│   ├── ignis_tables.sql
│   ├── ventis_tables.sql
│   ├── ecoa_tables.sql
│   ├── imago_tables.sql
│   ├── aurora_tables.sql
│   ├── lumina_tables.sql
│   ├── monetization_tables.sql     # Referrals, push, WA broadcast, chatbot
│   └── 20260223_consolidate_schema.sql
├── public/
│   ├── logos/                      # Brand assets (192px, 512px, maskable)
│   ├── manifest.json               # PWA manifest (overridden by vite config)
│   └── *.pdf                       # Legal documents (Privacy, Terms)
├── src/
│   ├── App.jsx                     # 70+ routes, lazy loading, ErrorBoundary
│   ├── main.jsx                    # React entry point
│   ├── components/                 # 195 JSX files total
│   │   ├── (19 root components)    # Auth, Navigation, Toast, UpdateBanner, etc.
│   │   ├── shared/                 # 11 components (cross-eco reusable)
│   │   ├── vitalis/                # 36 components
│   │   ├── aurea/                  # 15 components
│   │   ├── serena/                 # 17 components
│   │   ├── ignis/                  # 15 components
│   │   ├── ventis/                 # 16 components
│   │   ├── ecoa/                   # 17 components
│   │   ├── imago/                  # 17 components
│   │   ├── aurora/                 # 13 components
│   │   └── comunidade/             # 19 components
│   ├── contexts/
│   │   ├── AuthContext.jsx         # Auth + module access + safety timeout (3s)
│   │   ├── I18nContext.jsx         # Internationalization (pt, en, fr)
│   │   └── ThemeContext.jsx        # Dark/light mode + DarkModeToggle
│   ├── lib/                        # 55 JS files
│   │   ├── supabase.js             # Supabase client init
│   │   ├── subscriptions.js        # Vitalis subscription management (legacy)
│   │   ├── lumina-leituras.js      # 23 diagnostic patterns (4 categories)
│   │   ├── i18n.js                 # Translation system (pt, en, fr)
│   │   ├── coach.js                # Coach email whitelist + access control
│   │   ├── coachApi.js             # Coach API integration
│   │   ├── comunidade.js           # Community social logic (75+ prompts, resonance)
│   │   ├── ghost-users.js          # 23 simulated Mozambican profiles
│   │   ├── validacao.js            # Form validation + ARIA props
│   │   ├── genero.js               # Gender-adaptive text (102 M rules, 73 O rules)
│   │   ├── marketing-engine.js     # Marketing hooks + content (1000+ lines)
│   │   ├── referrals.js            # "Convida & Ganha" system (+7 days per conversion)
│   │   ├── whatsapp.js             # WhatsApp alerts (Meta Cloud API)
│   │   ├── emails.js               # Email utilities
│   │   ├── pushSubscription.js     # Web Push subscription management
│   │   ├── relatorios-pdf.js       # PDF report generation (client-side)
│   │   ├── broadcast-api.js        # Broadcast message API
│   │   ├── facebook-api.js         # Facebook API integration
│   │   ├── instagram-api.js        # Instagram API integration
│   │   ├── i18n/                   # Per-eco translations (11 files)
│   │   ├── shared/                 # Cross-module infrastructure
│   │   │   ├── subscriptionPlans.js # Centralized pricing (all Ecos + bundles)
│   │   │   ├── moduleFactory.js     # Subscription, gamification, chat factories
│   │   │   └── paymentFlow.js       # PayPal + M-Pesa payment handling
│   │   ├── vitalis/                # planoGenerator, calcularPorcoes, restricoesAlimentares
│   │   ├── aurea/                  # gamificacao (4 levels, 21 badges), praticas (100+), subscriptions
│   │   ├── serena/                 # gamificacao (16 emotions, 6 breathing), subscriptions
│   │   ├── ignis/                  # gamificacao (16 challenges), subscriptions
│   │   ├── ventis/                 # gamificacao (6 movements, 10 nature), subscriptions
│   │   ├── ecoa/                   # gamificacao (8-week Micro-Voz), subscriptions
│   │   ├── imago/                  # gamificacao (50 values, 7 dimensions), subscriptions
│   │   └── aurora/                 # gamificacao (7-component ritual), subscriptions (7/7 unlock)
│   ├── pages/                      # 26 page components
│   ├── styles/
│   │   └── global.css              # Tailwind v4, CSS vars, a11y, dark mode, animations
│   ├── test/
│   │   └── setup.js                # Vitest setup (jest-dom matchers)
│   └── utils/
│       ├── genero.js               # g(masc, fem) + gx(sexo, masc, fem) wrappers
│       ├── notifications.js        # Browser notification helpers
│       ├── ramadao.js              # Ramadan date handling
│       ├── referral.js             # Referral link utilities
│       └── utm.js                  # UTM tracking helpers
├── index.html                      # SEO: JSON-LD, Open Graph, skip-to-content, noscript
├── postcss.config.js               # @tailwindcss/postcss + autoprefixer
├── vite.config.js                  # Vite + PWA + code splitting
├── vitest.config.js                # jsdom + v8 coverage
├── vercel.json                     # Rewrites, crons, function memory limits
└── package.json                    # v1.0.1, ES Module
```

## The 10 Modules

| Eco | Chakra | Focus | Status | Components | Lib Files | Currency |
|-----|--------|-------|--------|------------|-----------|----------|
| **VITALIS** | Muladhara (Root) | Body/Nutrition | Paid | 36 | 3 | — |
| **ÁUREA** | — | Worth/Presence | Paid | 15 | 3 | Jóias de Ouro ✨ |
| **SERENA** | Svadhisthana | Emotion/Fluidity | Paid | 17 | 2 | Gotas 💧 |
| **IGNIS** | Manipura | Will/Focus | Paid | 15 | 2 | Chamas 🔥 |
| **VENTIS** | Anahata | Energy/Rhythm | Paid | 16 | 2 | Folhas 🍃 |
| **ECOA** | Vishuddha | Expression/Voice | Paid | 17 | 2 | Ecos 🔊 |
| **IMAGO** | Sahasrara | Identity/Essence | Paid | 17 | 2 | Estrelas ⭐ |
| **LUMINA** | Ajna | Vision/Diagnosis | Free | 1 (page) | 1 | — |
| **AURORA** | — | Final Integration | Free (7/7 unlock) | 13 | 2 | Raios 🌅 |
| **COMUNIDADE** | — | Social/Self-knowledge | Free | 19 | 2 | Luz Recebida |

### Eco Feature Details

**VITALIS** — Nutrition coaching with 4-phase progression (indução→transição→estabilização→manutenção). TMB calculation (Mifflin-St Jeor), 3 dietary approaches (keto/IF, low-carb, balanced), dietary restriction filtering (halal, lactose-free, gluten-free, vegetarian, vegan), daily check-ins, meal calendar, shopping lists, progress photos, weekly challenges, recipe browser, reports, fasting timer, Ramadan guide, workout tracker, coach chat.

**ÁUREA** — 100+ micro-practices in 4 categories (Dinheiro/Tempo/Roupa/Prazer). Onboarding flow, clothing mirror check-ins, worth wallet & diary, weekly insights, pattern analysis, audio meditations. Gamification: 4 levels (Bronze→Prata→Ouro→Diamante), 21 badges, practice-of-the-day.

**SERENA** — Emotional journal with 16-emotion wheel and 7 body zones. 6 breathing techniques (4-7-8, Box, Oceânica, Suspiro, Alternada, Coerência Cardíaca), 15 fluidity practices (3 difficulty levels), emotional cycle tracking, menstrual cycle integration, liberation rituals, SOS emotional support, emotion library, pattern detector.

**IGNIS** — Conscious choices tracker, focused sessions, distraction detector, weekly "cutting" exercises, values compass, achievement diary, 16 fire challenges (coragem/corte/alinhamento/iniciativa), action plan builder.

**VENTIS** — Energy monitor, routine builder, conscious pause exercises (8 types), movement flows (yoga, tai chi, dance, etc.), nature connection activities (10 types), rhythm analysis, peak/valley mapping, burnout detector, rituals vs routines comparison.

**ECOA** — Silencing map, 8-week progressive Micro-Voz program, phrase library, recovered voice journal, unsent letters (5 categories: perdão/raiva/gratidão/despedida/verdade), daily affirmations, expression exercises (5 types), assertive communication templates (4 patterns: sentimento/sanduíche/disco riscado/pedido claro), pattern tracking.

**IMAGO** — Triple mirror (essence/mask/aspiration), self-archaeology (5 layers: infância→presente), naming ceremony, identity map (7 dimensions), 50 core values selection, clothing-as-identity, journey timeline, eco integration review, 5 essence meditations (scripted, 8-15 min), future vision board.

**AURORA** — Graduation ceremony, before/after narrative, journey summary, maintenance mode, mentorship system, integrated ritual (7 eco components), annual renewal. Unlocks free when all 7 Ecos completed. Regression alert patterns (6 types).

**LUMINA** — Free diagnostic with 8 dimensions (corpo, passado, impulso, futuro, mente, energia, espelho, cuidado). 23 reading patterns across 4 severity categories (crítico, máximo, alerta, protecção). Menstrual cycle phase integration. Each pattern has 3 personalized Portuguese messages.

**COMUNIDADE** — Social network for self-knowledge:
- **Rio** (stream): Reflections feed with 11 themes, infinite scroll, immersive view, breathing breaks every 6 posts
- **Fogueira** (bonfire): Ephemeral 24h group chat, fire grows with contributions
- **Círculos** (circles): Eco-specific groups (3-15 members), guardian role, intention statements
- **Sussurros** (whispers): Private 1-on-1 support messaging with templates
- **Explorar**: People/posts/hashtag search, trending grid, follow suggestions
- **Jornada** (journey): User profile with stats, reflection history
- **Ressonância** (resonance, not "likes"): 5 reaction types (Ressoo, Luz, Força, Espelhar, Enraizar)
- **Espelhos** (mirrors, not "comments"): Guided comment starters
- **Ghost users**: 23 simulated Mozambican profiles for social proof (deterministic, client-side)
- **Bioluminescence levels**: Visual glow based on engagement (0-4 tiers)
- **Anonymous reflections**: Optional anonymity with 🌙 avatar

## Routing (App.jsx)

**70+ routes** organized by module. All modules except Home and Login are lazy-loaded via `React.lazy()`.

### Context Provider Hierarchy
```
BrowserRouter → ThemeProvider → I18nProvider → AuthProvider → ToastProvider → ErrorBoundary → UpdateBanner → AppRoutes
```

### Route Guards (8 per-eco + 1 generic)
```jsx
<VitalisRoute>    → ProtectedRoute + VitalisAccessGuard
<AureaRoute>      → ProtectedRoute + AureaAccessGuard
<SerenaRoute>     → ProtectedRoute + SerenaAccessGuard
<IgnisRoute>      → ProtectedRoute + IgnisAccessGuard
<VentisRoute>     → ProtectedRoute + VentisAccessGuard
<EcoaRoute>       → ProtectedRoute + EcoaAccessGuard
<ImagoRoute>      → ProtectedRoute + ImagoAccessGuard
<AuroraRoute>     → ProtectedRoute + AuroraAccessGuard (free, checks 7/7 completion)
<AuthRoute>       → Auth only, no subscription check (Lumina, Comunidade)
```

### Key Route Patterns
- Payment pages (`/{eco}/pagamento`) are **public** (no guard) — users can view pricing before login
- Login redirects preserve destination in `state.from` for post-login return
- Coach routes use inline `isSessionCoach()` check
- Home redirects coaches to `/coach` automatically
- Catch-all `*` redirects to `/`
- `LoadingFallback` shows "A carregar..." with ARIA `role="status"`

### Pages (26)
Home, Login, RecuperarPassword, MinhaConta, Perfil, Lumina, LandingVitalis, LandingAurea, LandingSerena, LandingIgnis, LandingVentis, LandingEcoa, LandingImago, LandingAurora, LandingBundle, LandingGeral, CatalogoPDF, PlanoHTML, CoachDashboard, CoachClienteDetalhe, CoachBroadcast, ChatbotTeste, AnalyticsDashboard, MarketingDashboard, SocialScheduler, ComingSoon

### Coach Routes (7)
- `/coach` — Dashboard (clients, alerts, WA broadcast, push notifications)
- `/coach/cliente/:userId` — Client detail (intake, plan, check-ins, status management)
- `/coach/marketing` — Marketing dashboard
- `/coach/analytics` — Analytics dashboard
- `/coach/chatbot-teste` — Chatbot simulator
- `/coach/social` — Social media scheduler (Instagram + Facebook)
- `/coach/broadcast` — Email/WA broadcast tool

## Shared Components (11)

Cross-eco reusable components in `src/components/shared/`:

| Component | Purpose |
|-----------|---------|
| AICoach.jsx | AI coach chat interface (used by all eco chat screens) |
| CheckInSystem.jsx | Generic check-in form builder |
| GamificationSystem.jsx | Points, levels, badges display |
| InsightEngine.jsx | Weekly insights generator |
| ModuleAccessGuard.jsx | Generic subscription guard for any eco |
| ModuleDashboardShell.jsx | Standard dashboard layout wrapper |
| ModuleHeader.jsx | Standard eco header with navigation |
| NotificacoesModule.jsx | Generic notification settings per eco |
| OnboardingShell.jsx | Onboarding flow wrapper |
| PagamentoEco.jsx | Generic payment page for any eco |
| PaymentPage.jsx | Payment page with plan selection |

## Root-Level Components (19)

| Component | Purpose |
|-----------|---------|
| Auth.jsx | Generic authentication UI |
| ErrorBoundary.jsx | Error boundary with Portuguese fallback + retry |
| Navigation.jsx | Bottom navigation bar (ARIA labels, `aria-current`) |
| Toast.jsx | Toast notification system (ToastProvider + useToast) |
| UpdateBanner.jsx | PWA update banner (shows 1x per deploy, dismissible) |
| SkipLink.jsx | Accessibility skip-to-content link |
| SustainabilityBadge.jsx | Green coding badge |
| LanguageSelector.jsx | Language picker (PT/EN/FR) |
| FieldError.jsx | ARIA-compliant form error display |
| ScrollReveal.jsx | Scroll-triggered animation wrapper |
| SEOHead.jsx | Dynamic meta tags for SEO |
| PartilharSocial.jsx | Social sharing buttons |
| PromptReferral.jsx | Referral prompt UI |
| UpsellCard.jsx | Eco upsell card |
| UpsellSystem.jsx | Cross-eco upsell orchestrator |
| WelcomeTutorial.jsx | First-time user tutorial |
| WhatsAppMockup.jsx | WhatsApp preview component |
| TemplateVisual.jsx | Visual template preview |

## API Serverless Functions

### Main Endpoints (11)

| Endpoint | Lines | Purpose |
|----------|-------|---------|
| `coach.js` | 1,247 | Coach backend: plan generation (TMB, macros), client management, WA broadcast, push notifications |
| `cron.js` | 83 | Central dispatcher routing 8 scheduled tasks |
| `diagnostico.js` | 205 | Full user account diagnostic (auth, intake, plans, subscription) |
| `enviar-email.js` | 530 | Email via Resend API (8 templates: boas-vindas, pagamento, lembrete, conquista, expiracao, coach alerts) |
| `gerar-pdf.js` | 91 | A4 PDF via Puppeteer headless Chromium (1GB memory, 60s timeout) |
| `gerar-plano-manual.js` | 314 | Manual plan gen (secret: `vivnasc2026`) |
| `regenerar-plano-emergencia.js` | 197 | Regenerate plan from existing intake (preserves history) |
| `facebook-publish.js` | 341 | Facebook Page publishing (post, photo, video, Reels, link) |
| `instagram-publish.js` | 444 | Instagram publishing (photo, carousel, story, reel) |
| `whatsapp-twilio.js` | 1,196 | WhatsApp API: templates, profile, WABA diagnostics, test messages |
| `whatsapp-webhook.js` | 943 | Webhook receiver: deduplication, rate limiting (5/min), anti-loop, media handling |

### Shared Libraries (_lib/) (13)

| File | Lines | Purpose |
|------|-------|---------|
| `chatbot-respostas.js` | 827 | 28 response keys (ecos, preços, trial, pagar, ajuda, etc.) in Vivianne's voice |
| `chatbot-log.js` | 70 | Non-blocking Supabase logging |
| `tarefas-agendadas.js` | 1,022 | Daily 9AM tasks: reminders, expiry warnings, streak celebrations, winback, coach summary |
| `email-sequencia.js` | 313 | Lead nurture (day 0→30): Lumina intro → VITALIS code `VEMVITALIS20` → urgência |
| `whatsapp-broadcast.js` | 455 | WA broadcast + 13 Meta approved templates |
| `wa-sequencia-cron.js` | 173 | WA nurture mirror (daily 11h, same as email sequence) |
| `wa-leads-cron.js` | 124 | Weekly Monday follow-up to non-converted leads |
| `trial-expiring-emails.js` | 374 | Automated emails at -3, -1, 0, +3 days from trial expiry |
| `broadcast-interessados.js` | 341 | Email broadcast: catálogo, novidade, promo, curiosidade, WA invite |
| `instagram-schedule.js` | 232 | Cron publisher for `scheduled_posts` table |
| `push-lembretes.js` | 256 | Push notifications 3x daily by time block (manhã/tarde/noite) |
| `fix-clients-status.js` | 67 | One-time data migration (null/novo → activo) |
| `test-intake-flow.js` | 243 | Integration test: create user → intake → plan → verify → cleanup |

### Vercel Cron Schedule

| Task | Schedule | Time (CAT/UTC+2) |
|------|----------|-------------------|
| trial-emails | `0 8 * * *` | 10:00 |
| tarefas | `0 19 * * *` | 21:00 |
| email-sequencia | `0 10 * * *` | 12:00 |
| instagram | `0 7 * * *` | 09:00 |
| wa-sequencia | `0 11 * * *` | 13:00 |
| wa-leads | `0 10 * * 1` | Monday 12:00 |
| push-lembretes (manhã) | `0 6 * * *` | 08:00 |
| push-lembretes (tarde) | `0 11 * * *` | 13:00 |
| push-lembretes (noite) | `0 17 * * *` | 19:00 |

## Authentication & Authorization

### Auth Flow
1. Supabase Auth handles login/registration
2. `AuthContext.jsx` syncs session, creates user record via UPSERT to `users` table
3. `checkModuleAccess()` queries `vitalis_clients` + `aurea_clients` for subscription status
4. Safety timeout (3s) prevents infinite loading
5. Active statuses: `['active', 'trial', 'tester']`
6. Coaches auto-unlock all modules via `isCoach(email)` check

### AuthContext Value
```jsx
{ session, loading, user, userRecord, vitalisAccess, aureaAccess, isCoachUser, refreshAccess }
```

### Coach Access
Restricted to emails in `src/lib/coach.js`:
- Default: `viv.saraiva@gmail.com`, `vivnasc@gmail.com`, `vivianne.saraiva@outlook.com`
- Override: `VITE_COACH_EMAILS` env var
- Coach WhatsApp: +258 85 100 6473

## Subscription System

Centralized in `src/lib/shared/subscriptionPlans.js`.

### Pricing (MZN)

| Eco | Mensal | Semestral | Anual |
|-----|--------|-----------|-------|
| **Vitalis** | 2,500 | 12,500 | 21,000 |
| **Áurea** | 975 | 5,265 | 9,945 |
| **Serena** | 750 | 3,825 | 7,200 |
| **Ignis** | 750 | 3,825 | 7,200 |
| **Ventis** | 750 | 3,825 | 7,200 |
| **Ecoa** | 750 | 3,825 | 7,200 |
| **Imago** | 975 | 4,972 | 9,360 |
| **Aurora** | Free (7/7 Ecos) | — | — |
| **Lumina** | Free | — | — |

### Bundle Discounts
| Bundle | Ecos | Discount |
|--------|------|----------|
| Duo | 2 | 15% |
| Trio | 3 | 25% |
| Jornada | 5+ | 35% |
| Tudo | 7 | 40% |

### Statuses
`tester` (permanent free) → `trial` (7 days) → `active` (paid) → `pending` (awaiting confirmation) → `expired` → `cancelled`

### Payment Methods
- **PayPal**: Sandbox/live via `VITE_PAYPAL_CLIENT_ID`
- **M-Pesa**: Manual transfer, confirmed by coach via WhatsApp
- **Promo code**: `VEMVITALIS20` — 20% off (2,500 → 2,000 MZN)

### Key Functions
- `checkEcoAccess(eco, userId)` — Generic access check for any eco
- `startEcoTrial(eco, userId)` — Start 7-day trial
- `calculateBundlePrice(ecoKeys, period)` — Apply bundle discount
- `createSubscriptionManager(eco)` — Factory (from moduleFactory.js)

## Gamification System

Each paid eco (except Vitalis) has a gamification system built via `createGamificacaoBase()` in `moduleFactory.js`:

| Eco | Currency | Levels | Badges | Special Content |
|-----|----------|--------|--------|----------------|
| **Áurea** | Jóias de Ouro ✨ | Bronze/Prata/Ouro/Diamante | 21 | 100+ micro-practices |
| **Serena** | Gotas 💧 | Nascente/Riacho/Rio/Oceano | 8 | 16 emotions, 6 breathing |
| **Ignis** | Chamas 🔥 | Faísca/Brasa/Chama/Fogueira | 8 | 16 fire challenges |
| **Ventis** | Folhas 🍃 | Semente/Broto/Árvore/Floresta | 8 | 6 movements, 10 nature |
| **Ecoa** | Ecos 🔊 | Sussurro/Voz/Canto/Ressonância | 8 | 8-week Micro-Voz |
| **Imago** | Estrelas ⭐ | Reflexo/Clareza/Sabedoria/Luminosidade | 8 | 5 meditations, 50 values |
| **Aurora** | Raios 🌅 | Aurora | 6 | 7-component ritual |

## Database Schema (85+ tables)

### Core

**users**: id, auth_id (FK auth.users), email, nome, genero, ciclo_activo, ultimo_periodo, duracao_ciclo, created_at, updated_at

### Per-Eco Client Tables (`{eco}_clients`)

All follow this base pattern:
- id, user_id (FK, UNIQUE), status, subscription_status, subscription_expires, subscription_updated, trial_started, pacote, data_inicio, payment_method, payment_reference, payment_amount, payment_currency (DEFAULT 'MZN'), created_at, updated_at

**Eco-specific columns:**

| Table | Extra Columns |
|-------|---------------|
| `vitalis_clients` | fase_actual, duracao_programa, objectivo_principal, peso_inicial, peso_actual, peso_meta, imc_inicial, imc_actual, emocao_dominante, prontidao_1a10 |
| `aurea_clients` | quota_tempo_horas, quota_dinheiro_mzn, quota_energia_actividades, joias_total, streak_quota, melhor_streak, badges_desbloqueados (JSONB), onboarding_complete, notificacoes_config (JSONB), whatsapp_numero, whatsapp_activo |
| `serena_clients` | emocao_dominante, nivel_fluidez (1-10), ultimo_checkin_emocional |
| `ignis_clients` | foco_actual, nivel_disciplina (1-10), escolhas_feitas |
| `ventis_clients` | nivel_energia, ritmo_preferido, burnout_score (0-100) |
| `ecoa_clients` | nivel_voz (1-10), silenciamentos_mapeados, semana_micro_voz, silenciamento_mapeado |
| `imago_clients` | fase_identidade, valores_definidos, espelho_completo |
| `aurora_clients` | ecos_completados (TEXT[]), graduacao_data, raios_total, modo_manutencao, mentora, renovacao_data |

### Vitalis-Specific Tables (12 total)
- `vitalis_intake` — Full intake form (70+ fields: personal, body metrics, dietary, emotional, activity, sleep, diet history)
- `vitalis_meal_plans` — Generated plans (versao, fase, abordagem, macros JSONB, receitas_incluidas JSONB)
- `vitalis_checkins` — Daily (peso, agua, energia/humor/sono 1-5, seguiu_plano, fez_exercicio)
- `vitalis_habitos` — Habit tracker (14-day cycles, 5 categories)
- `vitalis_medidas_log` — Weekly body measurements (cintura, anca)
- `vitalis_calendario_refeicoes` — Weekly meal calendar
- `vitalis_templates_semana` — Saved weekly meal templates (JSONB)
- `vitalis_alerts` — Coach alerts (6 types, 4 priorities)
- `vitalis_subscription_log` — Status change history
- `vitalis_registos` — Generic records

### Áurea Tables (13 total)
aurea_subscription_log, aurea_checkins_quota, aurea_praticas_log, aurea_joias_log, aurea_culpa_log, aurea_roupa_checkins, aurea_roupa_pecas, aurea_carteira, aurea_carteira_entries, aurea_diario, aurea_chat_messages, aurea_chat_themes, aurea_audios_log

### Serena Tables (8)
serena_emocoes_log, serena_respiracao_log, serena_rituais_log, serena_praticas_log, serena_ciclo_emocional, serena_ciclo_menstrual, serena_chat_messages

### Ignis Tables (10)
ignis_valores, ignis_escolhas, ignis_foco_sessions, ignis_dispersao_log, ignis_corte_semanal, ignis_conquistas_log, ignis_desafios_log, ignis_plano_accao, ignis_chat_messages

### Ventis Tables (9)
ventis_energia_log, ventis_rotinas, ventis_rotinas_log, ventis_pausas_log, ventis_movimento_log, ventis_natureza_log, ventis_burnout_alertas, ventis_chat_messages

### Ecoa Tables (10)
ecoa_silenciamento, ecoa_micro_voz_log, ecoa_voz_recuperada, ecoa_diario_voz, ecoa_cartas, ecoa_afirmacoes_log, ecoa_exercicios_log, ecoa_comunicacao_log, ecoa_chat_messages

### Imago Tables (11)
imago_espelho_triplo, imago_arqueologia, imago_nomeacao, imago_identidade, imago_valores, imago_roupa_identidade, imago_meditacoes_log, imago_visao_board, imago_integracoes_log, imago_chat_messages

### Aurora Tables (7)
aurora_graduacao, aurora_antes_depois, aurora_manutencao_log, aurora_mentoria, aurora_ritual_log, aurora_renovacao, aurora_chat_messages

### Lumina Tables (4)
- `lumina_checkins` — 8-dimension check-in + cycle phase
- `lumina_leituras` — Generated readings (pattern + text)
- `lumina_padroes` — 23 pattern catalog (severity 1-5, eco recommendations)
- `waitlist` — Lead capture (nome, email, whatsapp, produto)

### Community Tables (14)
- `community_profiles` — display_name, bio, avatar_emoji, avatar_url, ecos_activos (TEXT[]), luz_recebida, reflexoes_count
- `community_posts` — tipo (16 types), eco, conteudo (≤1000), is_anonymous, imagem_url, hashtags (TEXT[]), ressonancia_count
- `community_likes` — Resonance reactions (UNIQUE per post+user)
- `community_comments` — Mirrors (≤500 chars)
- `community_follows` — follower_id, following_id (CHECK: can't follow self)
- `community_circulos` — eco, nome, descricao, intencao, max_membros (3-15), criadora_id
- `community_circulo_membros` — role ('guardia'|'membro')
- `community_fogueira` — tema, prompt, expires_at (24h)
- `community_fogueira_chamas` — Bonfire contributions (≤300 chars)
- `community_conversations` — DM pairs (user1_id, user2_id)
- `community_messages` — conversation_id, sender_id, conteudo (≤500), imagem_url
- `community_notifications` — tipo (6 types: ressonância, espelho, sussurro, círculo, fogueira, seguir)

### Monetization & Operations Tables (6)
- `referral_codes` — code (UNIQUE), max_uses, total_uses, successful_conversions, bonus_days_earned
- `referral_uses` — referrer_user_id, referred_user_id, status (trial_started/converted/expired)
- `push_subscriptions` — email, endpoint (UNIQUE), keys_p256dh, keys_auth
- `whatsapp_broadcast_log` — telefone, mensagem, tipo, status, erro, message_id, grupo
- `chatbot_mensagens` — telefone, nome, mensagem_in, mensagem_out, chave_detectada, notificou_coach, canal, sessao_id

## Development

### Setup
```bash
npm install

# Create .env file
VITE_SUPABASE_URL=https://vvvdtogvlutrybultffx.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id  # Optional
VITE_PAYPAL_MODE=sandbox  # or 'live'
VITE_COACH_EMAILS=email1@x.com,email2@y.com  # Optional override
```

### Commands
```bash
npm run dev           # Start dev server on port 3000
npm run build         # Production build with code splitting
npm run preview       # Preview production build
npm run test          # Run tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with v8 coverage
```

### Build Configuration
**Code Splitting** (vite.config.js):
```javascript
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-supabase': ['@supabase/supabase-js']
}
```

### Styling
1. **Tailwind CSS v4** via build-time PostCSS compilation (NOT CDN, no tailwind.config.js)
2. **CSS Variables** in `src/styles/global.css` for theming
3. **Dark mode** via `.dark` class on `:root` (ThemeContext toggles)
4. **Design tokens**: `--eco-*-*`, `--lumina-*`, `--vitalis-*`
5. **Animations**: `animate-page-enter`, `animate-card-reveal`, `animate-sheet-up`

### Testing
- **Framework**: Vitest 4 + React Testing Library 16 + jest-dom
- **Environment**: jsdom
- **Coverage**: v8 provider (text + lcov reporters)
- **Pattern**: `src/**/*.{test,spec}.{js,jsx}`

### PWA Configuration
- **Register type**: autoUpdate
- **Manifest**: Sete Ecos branded (pt, #4B0082 theme, standalone, portrait)
- **Shortcuts**: Lumina (diagnóstico), Vitalis (dashboard)
- **Icons**: 192px, 512px PNG + maskable 512px
- **Cache strategies**:
  - Images: CacheFirst (30 days, max 100 entries)
  - Fonts: CacheFirst (1 year, max 20)
  - Google Fonts: StaleWhileRevalidate (1 year)
  - Supabase API: NetworkFirst (24h, max 50, 10s timeout)
- **Offline**: Fallback to `/index.html`, deny `/api/*`
- **Max cache size**: 3 MB
- **Update banner**: Shows 1x per deploy, dismissible "Depois" button

## Accessibility (WCAG 2.2 AA)

- Skip-to-content link in index.html (`<a href="#main-content">`)
- `<main id="main-content" role="main">` wrapper
- ARIA labels on all navigation elements
- `aria-current="page"` on active nav items
- `aria-hidden="true"` on decorative elements
- Focus-visible styles (keyboard navigation)
- Reduced motion support (`prefers-reduced-motion`)
- High contrast support (`prefers-contrast`)
- Print styles
- Form validation with ARIA: `fieldErrorProps()` → `role="alert"`, `aria-live="assertive"`
- Input ARIA: `inputAriaProps()` → `aria-invalid`, `aria-describedby`
- `DarkModeToggle` uses `role="switch"`, `aria-checked`
- Loading states use `role="status"`, `aria-live="polite"`

## SEO (index.html)

- **Open Graph**: website type, pt_PT locale, og:image 1200x630
- **JSON-LD Structured Data**:
  - Organization: Sete Ecos, founder Vivianne Saraiva, Maputo MZ
  - WebApplication: HealthApplication, price range 0-21,000 MZN
  - WebSite: For Google Sitelinks Search Box
- **Apple meta**: touch icon, mobile-web-app-capable, status bar
- **Noscript**: Complete fallback HTML with features and contact info

## Security Notes

- `.env` files gitignored
- Supabase RLS enabled on all tables
- Coach emails whitelist with env var fallback
- PayPal sandbox/live modes
- Error boundaries prevent crash info leakage
- WhatsApp webhook: message deduplication (5-min cache), rate limiting (5/min per number), anti-loop detection
- Manual plan endpoint requires secret (`?secret=vivnasc2026`)
- Form validation sanitizes basic XSS (strips HTML tags)
- Input validation with max lengths on all text fields

## Gender Sensitivity (MANDATORY)

**All user-facing Portuguese text MUST be gender-adaptive.** The platform serves both men and women. Never hardcode feminine-only text.

### Core Implementation: `src/lib/genero.js`
- 3 genders: F (Feminino), M (Masculino), O (Prefiro não especificar)
- `adaptarTextoGenero(texto, genero)` — 102 replacement rules for M, 73 for O
- `saudacao(genero)` — M: "Guerreiro", F: "Guerreira", O: "Explorador"
- `bemVindo(genero)` — M: "Bem-vindo", F: "Bem-vinda", O: "Bem-vindo(a)"
- `mostrarCicloMenstrual(genero)` — Only show for F/O, hide for M
- `taglineSistema(genero)` — M/O: "Transmutação Integral", F: "Transmutação Feminina"

### Client-Side Wrapper: `src/utils/genero.js`
```jsx
// Components (reads from localStorage 'vitalis-sexo')
import { g } from '../utils/genero'
g('Bem-vindo', 'Bem-vinda')     // auto-adapts

// Coach dashboard, emails, API (explicit)
import { gx } from '../utils/genero'
gx(intake?.sexo, 'Bem-vindo', 'Bem-vinda')
```

### Rules
1. **NEVER** write hardcoded gendered Portuguese words in user-facing text. Always use `g()` or `gx()`.
2. **Client-side components**: use `g(masc, fem)` — reads from localStorage.
3. **Coach dashboard**: use `gx(sexo, masc, fem)` with `intake?.sexo` or `client.sexo`.
4. **Email templates** (`api/enviar-email.js`): use `dados.sexo` to build gender helpers.
5. **Default is feminine** (majority of users), but code must support both.

### Common gendered words

| Masculino | Feminino | Usage |
|-----------|----------|-------|
| Bem-vindo | Bem-vinda | Greetings |
| querido | querida | Terms of endearment |
| obrigado | obrigada | Thanks |
| perfeito | perfeita | Motivational |
| cansado | cansada | State descriptions |
| motivado | motivada | State descriptions |
| activo | activa | Status labels |
| conectado | conectada | State descriptions |
| sozinho | sozinha | State descriptions |
| inscrito | inscrita | Registration |
| preparado | preparada | Readiness |

## Content Generation Policy (MANDATORY)

### 1. Língua portuguesa com acentos SEMPRE

- **NUNCA** escrever texto em português sem acentos: `'Olá'` nunca `'Ola'`, `'não'` nunca `'nao'`
- Palavras frequentes: Olá, não, código, Motivação, sequência, audiência, histórico, último, número, automática, disponível, exercício, publicação, vídeo, fácil, equilíbrio, subscrição, diagnóstico, saúde, início, próximo

### 2. Gender sensitivity em conteúdos

- **Sexo conhecido**: usar `g()` ou `gx()`
- **Sexo desconhecido** (waitlist, leads, nurturing): linguagem neutra ("pessoas", "Bem-vindo(a)")
- **NUNCA** usar termos exclusivamente femininos sem alternativa
- **Excepção**: testemunhos específicos podem manter o género original

### 3. Layout mobile-first SEMPRE

- Classes responsivas: `text-sm sm:text-base`, `p-3 sm:p-4`, `gap-1.5 sm:gap-2`
- Botões: `py-2.5` mínimo (44px touch target)
- Overflow: `truncate` + `min-w-0`
- Listas: `overflow-y-auto max-h-[60vh]`
- Modais: `items-end sm:items-center`
- Feedback táctil: `active:scale-95`
- **NUNCA** layout que só funcione em desktop

### 4. Tom de voz (Vivianne)

- Directo, humano, sem formalidades
- Tutear sempre (tu, teu, tua — nunca você/seu/sua em PT-PT)
- Frases curtas, parágrafos curtos
- Assinar sempre com "— Vivianne"
- Máximo 1-2 emojis por mensagem
- Máximo 1 exclamação por parágrafo

### 5. Consistência entre canais

- Email e WhatsApp devem ter o mesmo conteúdo (adaptado ao formato):
  - Email: mais longo, HTML, headers e botões visuais
  - WhatsApp: mais curto, texto puro com *negrito* e _itálico_
- Sequência de nurturing (dia 0-30):
  - Email: `api/_lib/email-sequencia.js`
  - WhatsApp: `api/_lib/whatsapp-broadcast.js` + `api/_lib/wa-sequencia-cron.js`
- Alterar num canal → alterar no outro

### 6. Preços e códigos promo

- Preços: ver tabela na secção Subscription System
- Código activo: `VEMVITALIS20` — 20% desconto (2,500 → 2,000 MZN)
- URL: `https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20`
- **NUNCA** inventar preços ou códigos sem confirmar com a Vivianne

## Common Tasks

1. **Adding feature to any Eco**: Create in `src/components/{eco}/`, add lazy import in `App.jsx`, wrap with `{Eco}Route` guard
2. **Adding translations**: Update `src/lib/i18n.js` translations object
3. **Changing subscription prices**: Update `src/lib/shared/subscriptionPlans.js` (single source of truth)
4. **Adding gamification**: Use `createGamificacaoBase()` from `src/lib/shared/moduleFactory.js`
5. **Adding new chat**: Use `createChatBase()` from `src/lib/shared/moduleFactory.js`
6. **Running tests**: `npm run test` or `npm run test:watch`
7. **Email/WhatsApp sequences**: Edit both `api/_lib/email-sequencia.js` AND `api/_lib/whatsapp-broadcast.js` (keep in sync)
8. **Community features**: Logic in `src/lib/comunidade.js`, components in `src/components/comunidade/`
9. **Adding cron task**: Add case in `api/cron.js`, create handler in `api/_lib/`, add schedule in `vercel.json`
10. **Social media publishing**: Schedule via `scheduled_posts` table, published by `api/_lib/instagram-schedule.js`

## i18n Translation Files

Per-eco translations in `src/lib/i18n/` (11 files):
aurea.js, aurora.js, comunidade.js, ecoa.js, ignis.js, imago.js, lumina.js, lumina-leituras.js, serena.js, ventis.js, vitalis.js

Main translation system: `src/lib/i18n.js` — supports `pt`, `en`, `fr`

## Additional Project Directories

The repository contains two secondary projects (separate from the main PWA):
- `os-7-veus-site/` — Next.js marketing site for Sete Ecos
- `escola-breno/` — Education sub-project (language learning)

**Do not modify** these unless explicitly asked.

## Scripts & Utilities

`scripts/` directory contains SQL and JS utilities for data maintenance:
- `CREATE_SCHEDULED_POSTS.sql` — Post scheduling setup
- `FIX_EXISTING_CLIENTS.sql` — Client data fixes
- `create-promo-20.js` — Promo code creation
- `criar-usuario-teste-vitalis.js` — Test user creation
- `limpar-users-teste.js/.sql` — Clean test users
- `VERIFICAR-DADOS-INVALIDOS.sql` — Data validation

`database/` directory contains seed data:
- `calendario-refeicoes.sql` — Meal calendar seeds
- `receitas-mocambicanas.sql` — Mozambican recipes
- `comunidade-social.sql` — Community social data (v1)
- `comunidade-v2.sql` — Community data (v2: sussurros, fogueira)

## Referral System

"Convida & Ganha" — `src/lib/referrals.js`:
- Code format: `ECOS-XXXXXX`
- Max 10 referrals per user
- Reward: +7 days free per successful conversion
- Tables: `referral_codes`, `referral_uses`

## Marketing Automation

- `src/lib/marketing-engine.js` — 15 provocative hooks + 8 body content blocks, Mozambique-specific (matapa, xima, nhemba)
- `api/_lib/tarefas-agendadas.js` — Winback emails (15% discount for expired), curiosity campaigns, streak celebrations
- `api/_lib/email-sequencia.js` — Day 0→30 nurture: Lumina intro → 3 sinais → segredo → VITALIS convite → testemunho → última chance
- Ghost users in community for social proof (23 Mozambican profiles, deterministic)
