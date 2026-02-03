# CLAUDE.md - AI Assistant Guide for SETE ECOS PWA

## Project Overview

**SETE ECOS** is a Portuguese feminine transformation system (Sistema de Transmutacao Feminina) built as a Progressive Web Application. The platform consists of 7 "Ecos" (Echoes), each addressing different aspects of feminine wellness based on chakra principles.

**Owner**: Vivianne dos Santos
**Primary Language**: Portuguese (Portugal/Mozambique)
**Target Market**: Women seeking holistic wellness, primarily in Mozambique and Portugal

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3 + Vite 5 |
| Routing | React Router DOM 6.22 |
| Backend/Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS (CDN) + Custom CSS Variables |
| Charts | Recharts 2.12 |
| PWA | vite-plugin-pwa + Workbox |
| PDF Generation | Puppeteer (serverless via Vercel) |
| Deployment | Vercel |

## Architecture

```
sete-ecos-pwa/
├── api/                    # Vercel serverless functions
│   └── gerar-pdf.js        # PDF generation endpoint
├── public/
│   ├── logos/              # Brand assets for all 7 Ecos
│   ├── manifest.json       # PWA manifest
│   └── *.pdf               # Legal documents (Privacy, Terms)
├── src/
│   ├── App.jsx             # Main routing and auth state
│   ├── main.jsx            # React entry point
│   ├── components/
│   │   ├── Auth.jsx        # Generic authentication
│   │   ├── Navigation.jsx  # Bottom navigation bar
│   │   └── vitalis/        # Vitalis module components (20+ files)
│   ├── contexts/
│   │   └── ThemeContext.jsx # Dark/light mode
│   ├── lib/
│   │   ├── supabase.js     # Supabase client + helper functions
│   │   ├── subscriptions.js # Subscription management system
│   │   ├── lumina-leituras.js # Lumina reading patterns (23 patterns)
│   │   └── vitalis/        # Vitalis-specific logic
│   ├── pages/
│   │   ├── Home.jsx        # Landing hub
│   │   ├── Lumina.jsx      # Lumina module (free)
│   │   ├── LandingGeral.jsx # Main marketing landing
│   │   ├── LandingVitalis.jsx # Vitalis-specific landing
│   │   ├── CoachDashboard.jsx # Admin/coach dashboard
│   │   └── PlanoHTML.jsx   # PDF-ready plan view
│   ├── styles/
│   │   └── global.css      # CSS variables, animations, dark mode
│   └── utils/
│       └── notifications.js # Browser notification helpers
├── index.html              # App entry with Tailwind CDN
├── vite.config.js          # Vite + PWA configuration
└── package.json
```

## The 7 Ecos (Modules)

Each "Eco" corresponds to a chakra and wellness dimension:

| Eco | Chakra | Focus | Status |
|-----|--------|-------|--------|
| **VITALIS** | Muladhara (Root) | Body/Nutrition | Active (Paid) |
| **SERENA** | Svadhisthana | Emotion | Planned |
| **IGNIS** | Manipura | Will/Focus | Planned |
| **VENTIS** | Anahata | Energy/Rhythm | Planned |
| **ECOA** | Vishuddha | Expression/Voice | Planned |
| **LUMINA** | Ajna | Vision/Diagnosis | Active (Free) |
| **IMAGO** | Sahasrara | Identity | Planned |
| **AURORA** | - | Final Integration | Future |

### LUMINA Module (Free)
- Daily check-in with 7 inputs (energy, body tension, self-image, past focus, future focus, mental clarity, connection desire)
- 23 pattern readings based on input combinations
- Pattern categories: Critical (3), Maximum (2), Alert (8), Protection (1), Transition (4), Equilibrium (5)
- File: `src/lib/lumina-leituras.js`

### VITALIS Module (Paid)
Primary paid module with comprehensive nutrition coaching:
- **Dashboard**: Daily overview with gamification (streaks, XP, achievements)
- **Check-in Diario**: Daily tracking (meals, water, sleep, exercise, fasting)
- **Plano Alimentar**: Personalized nutrition plan with hand-portion system
- **Receitas**: Recipe browser with detailed views
- **Espaco Retorno**: Emotional support space with recovery tools
- **Desafios Semanais**: Weekly challenges
- **Chat Coach**: AI coaching (Vivianne persona)
- **Relatorios**: Weekly reports and trend graphs
- **Fotos Progresso**: Progress photo tracking
- **Lista Compras**: Shopping list generator
- **Calendario**: Meal calendar view

## Authentication & Authorization

### Auth Flow
1. Supabase Auth handles login/registration
2. User record created in `users` table with `auth_id` reference
3. Session managed via `supabase.auth.onAuthStateChange`

### Subscription System (`src/lib/subscriptions.js`)

**Subscription Statuses**:
- `tester`: Free permanent access (manually assigned)
- `trial`: Trial period (currently 0 days configured)
- `active`: Paid subscription
- `pending`: Awaiting payment confirmation
- `expired`: Subscription ended
- `cancelled`: User cancelled

**Subscription Plans**:
```javascript
MONTHLY:  2,500 MZN (~$38 USD)  - 1 month
SEMESTRAL: 12,500 MZN (~$190 USD) - 6 months, 17% discount
ANNUAL:   21,000 MZN (~$320 USD) - 12 months, 30% discount
```

**Access Control**:
- `VitalisAccessGuard` component wraps protected routes
- Checks `vitalis_clients` table for subscription status
- Redirects to `/vitalis/pagamento` if no access

### Admin Access
Coach dashboard at `/coach` restricted to: `viv.saraiva@gmail.com`

## Key Routes

```
/                   - Home (hub)
/landing            - Marketing landing page
/lumina             - Lumina module (requires auth)
/vitalis            - Vitalis landing/marketing
/vitalis/login      - Vitalis-specific auth
/vitalis/pagamento  - Payment page
/vitalis/intake     - Onboarding questionnaire (protected)
/vitalis/dashboard  - Main dashboard (protected)
/vitalis/checkin    - Daily check-in (protected)
/vitalis/plano      - Nutrition plan (protected)
/vitalis/receitas   - Recipe browser (protected)
/vitalis/receita/:id - Recipe detail
/vitalis/chat       - AI coach chat (protected)
/vitalis/relatorios - Reports hub (protected)
/vitalis/tendencias - Trend graphs (protected)
/vitalis/perfil     - User profile (protected)
/coach              - Coach admin dashboard (restricted)
```

## Database Schema (Supabase)

Inferred from code - key tables:

```
users
├── id (uuid, PK)
├── auth_id (references auth.users)
├── email
└── created_at

vitalis_clients
├── id (uuid, PK)
├── user_id (FK -> users.id)
├── subscription_status (enum)
├── subscription_expires (timestamp)
├── subscription_plan
├── trial_started
├── payment_method
├── payment_reference
├── payment_amount
├── payment_currency
└── created_at

lumina_checkins
├── id, user_id, data
├── energia, tensao, imagem, passado, futuro, clareza, conexao
└── created_at

lumina_leituras
├── id, user_id, checkin_id
├── padrao, mensagem
└── created_at

vitalis_alerts
├── id, user_id
├── tipo_alerta, descricao, prioridade, status
└── created_at

vitalis_subscription_log
├── id, user_id, new_status, details
└── created_at

vitalis_invite_codes
├── id, code, type, max_uses, uses_count, active
└── created_at

waitlist
├── id, nome, email, whatsapp, produto
└── created_at
```

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
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run preview  # Preview production build
```

### PWA Configuration
- Auto-update registration
- Caches: images (30 days), fonts (1 year), Supabase API (24h, network-first)
- Start URL: `/vitalis/dashboard`
- Theme color: `#7C8B6F` (sage green)

## Code Conventions

### File Naming
- Components: PascalCase.jsx (e.g., `DashboardVitalis.jsx`)
- Utils/libs: camelCase.js (e.g., `lumina-leituras.js`)
- Styles: Component.css alongside Component.jsx

### Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
// ... other imports

export default function ComponentName() {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Supabase queries
  };

  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
}
```

### Styling Approach
1. **Tailwind CSS** (via CDN) for utility classes
2. **CSS Variables** in `global.css` for theming:
   - `--lumina-*` for Lumina colors
   - `--vitalis-*` for Vitalis colors
   - `--eco-*-*` for each Eco's color
3. **Dark mode** via `.dark` class on `:root`

### Portuguese Text
- All user-facing text in Portuguese
- Avoid accents in code identifiers
- Comments can be in Portuguese or English
- Date format: `pt-PT` locale

### Error Handling Pattern
```javascript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  // process data
} catch (error) {
  console.error('Descricao do erro:', error);
  // Show user-friendly message
}
```

## Important Patterns

### Protected Route Pattern
```jsx
<Route
  path="/vitalis/feature"
  element={
    session ? (
      <VitalisAccessGuard>
        <FeatureComponent />
      </VitalisAccessGuard>
    ) : (
      <Navigate to="/vitalis/login" />
    )
  }
/>
```

### Supabase Query Pattern
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2, relation(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Date Handling
```javascript
const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const dataFormatada = new Date().toLocaleDateString('pt-PT', {
  day: 'numeric',
  month: 'long'
});
```

## Deployment (Vercel)

1. Push to GitHub repository
2. Connect Vercel to repo
3. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PAYPAL_CLIENT_ID` (if using PayPal)
   - `VITE_PAYPAL_MODE`
4. Deploy automatically on push

### Serverless Functions
- Located in `/api/` directory
- Vercel routes automatically
- PDF generation uses `@sparticuz/chromium-min` for serverless Chromium

## Git Workflow

- Main branch for production
- Feature branches: `claude/feature-name-*` for AI-assisted development
- Commit messages in English or Portuguese

## Testing Considerations

- No test framework currently configured
- Manual testing via `npm run dev`
- Test subscription flows with `tester` status

## Security Notes

- `.env` files gitignored
- Supabase RLS (Row Level Security) should be configured for production
- Coach email hardcoded - consider environment variable for flexibility
- PayPal integration supports sandbox/live modes

## Common Tasks for AI Assistants

1. **Adding new Vitalis feature**: Create component in `src/components/vitalis/`, add route in `App.jsx` with `VitalisAccessGuard`
2. **Modifying subscription plans**: Update `SUBSCRIPTION_PLANS` in `src/lib/subscriptions.js`
3. **Adding new Eco module**: Follow LUMINA/VITALIS patterns, create dedicated folder in components
4. **Styling changes**: Use Tailwind utilities, add CSS variables to `global.css` if needed
5. **Database changes**: Update Supabase schema, then update relevant lib files

## Contact & Resources

- **Supabase Dashboard**: Access via Vercel project settings
- **PayPal Developer**: For payment testing/configuration
- **Vercel Dashboard**: For deployment and function logs
