import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import RegisterSW from '@/components/RegisterSW'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthGate } from '@/components/AuthGate'
import OnboardingGate from '@/components/OnboardingGate'
import QuickLog from '@/components/QuickLog'
import InstallPrompt from '@/components/InstallPrompt'
import ErrorBoundary from '@/components/ErrorBoundary'
import ModoLocalBanner from '@/components/ModoLocalBanner'
import SyncErrorBanner from '@/components/SyncErrorBanner'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'opsz']
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'FénixFit · 60 dias',
  description: 'companheira de jornada · 60 dias',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FénixFit'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F1E8' },
    { media: '(prefers-color-scheme: dark)', color: '#14110D' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}

// Script inline · aplica tema + paleta ANTES da página renderizar (evita flash)
const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('fenixfit:theme') || 'system';
    var paleta = localStorage.getItem('fenixfit:paleta') || 'classica';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    var palettes = {
      classica: { light: {bg:'#F6F1E8',bgElev:'#FBF7EE',surface:'#FFFFFF',surfaceSoft:'rgba(255,255,255,0.55)',ink:'#1F1814',inkSoft:'rgba(31,24,20,0.7)',inkFaint:'rgba(31,24,20,0.5)',ouro:'#B8924A',hair:'rgba(184,146,74,0.18)',hairStrong:'rgba(184,146,74,0.32)'}, dark: {bg:'#14110D',bgElev:'#1B1813',surface:'#221E18',surfaceSoft:'rgba(34,30,24,0.6)',ink:'#EDE5D2',inkSoft:'rgba(237,229,210,0.75)',inkFaint:'rgba(237,229,210,0.5)',ouro:'#C9A961',hair:'rgba(201,169,97,0.16)',hairStrong:'rgba(201,169,97,0.3)'} },
      rosa: { light: {bg:'#FAEEEC',bgElev:'#FDF5F3',surface:'#FFFFFF',surfaceSoft:'rgba(255,255,255,0.6)',ink:'#3D1E25',inkSoft:'rgba(61,30,37,0.72)',inkFaint:'rgba(61,30,37,0.5)',ouro:'#B85F6B',hair:'rgba(184,95,107,0.18)',hairStrong:'rgba(184,95,107,0.32)'}, dark: {bg:'#1F1015',bgElev:'#28161C',surface:'#301A21',surfaceSoft:'rgba(48,26,33,0.6)',ink:'#F0DCDF',inkSoft:'rgba(240,220,223,0.75)',inkFaint:'rgba(240,220,223,0.5)',ouro:'#D88090',hair:'rgba(216,128,144,0.18)',hairStrong:'rgba(216,128,144,0.32)'} },
      azul: { light: {bg:'#EDF0F5',bgElev:'#F4F6FA',surface:'#FFFFFF',surfaceSoft:'rgba(255,255,255,0.6)',ink:'#1A2438',inkSoft:'rgba(26,36,56,0.72)',inkFaint:'rgba(26,36,56,0.5)',ouro:'#5C7A99',hair:'rgba(92,122,153,0.18)',hairStrong:'rgba(92,122,153,0.32)'}, dark: {bg:'#0F1320',bgElev:'#161B2B',surface:'#1C2235',surfaceSoft:'rgba(28,34,53,0.6)',ink:'#DDE5F0',inkSoft:'rgba(221,229,240,0.75)',inkFaint:'rgba(221,229,240,0.5)',ouro:'#8AA4C0',hair:'rgba(138,164,192,0.18)',hairStrong:'rgba(138,164,192,0.32)'} },
      ouro: { light: {bg:'#F8EDD9',bgElev:'#FBF3E2',surface:'#FFFAEF',surfaceSoft:'rgba(255,250,239,0.6)',ink:'#2B1F0F',inkSoft:'rgba(43,31,15,0.72)',inkFaint:'rgba(43,31,15,0.5)',ouro:'#C97D2A',hair:'rgba(201,125,42,0.2)',hairStrong:'rgba(201,125,42,0.35)'}, dark: {bg:'#1A1308',bgElev:'#221A0E',surface:'#2B2014',surfaceSoft:'rgba(43,32,20,0.6)',ink:'#EFDCB7',inkSoft:'rgba(239,220,183,0.75)',inkFaint:'rgba(239,220,183,0.5)',ouro:'#E0A052',hair:'rgba(224,160,82,0.18)',hairStrong:'rgba(224,160,82,0.32)'} },
      verde: { light: {bg:'#ECF0E5',bgElev:'#F3F6ED',surface:'#FFFFFF',surfaceSoft:'rgba(255,255,255,0.6)',ink:'#1F2A18',inkSoft:'rgba(31,42,24,0.72)',inkFaint:'rgba(31,42,24,0.5)',ouro:'#6B8050',hair:'rgba(107,128,80,0.18)',hairStrong:'rgba(107,128,80,0.32)'}, dark: {bg:'#101410',bgElev:'#171C16',surface:'#1E251D',surfaceSoft:'rgba(30,37,29,0.6)',ink:'#DFE5D5',inkSoft:'rgba(223,229,213,0.75)',inkFaint:'rgba(223,229,213,0.5)',ouro:'#9AB07A',hair:'rgba(154,176,122,0.18)',hairStrong:'rgba(154,176,122,0.32)'} }
    };
    var t = (palettes[paleta] || palettes.classica)[isDark ? 'dark' : 'light'];
    var r = document.documentElement.style;
    r.setProperty('--bg', t.bg);
    r.setProperty('--bg-elev', t.bgElev);
    r.setProperty('--surface', t.surface);
    r.setProperty('--surface-soft', t.surfaceSoft);
    r.setProperty('--ink', t.ink);
    r.setProperty('--ink-soft', t.inkSoft);
    r.setProperty('--ink-faint', t.inkFaint);
    r.setProperty('--ouro', t.ouro);
    r.setProperty('--hair', t.hair);
    r.setProperty('--hair-strong', t.hairStrong);
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthGate>
              <OnboardingGate>
                <ModoLocalBanner />
                <SyncErrorBanner />
                <main className="container-app pb-32 pt-4 sm:pt-8">
                  <ErrorBoundary>{children}</ErrorBoundary>
                </main>
                <Navigation />
                <QuickLog />
                <InstallPrompt />
              </OnboardingGate>
            </AuthGate>
            <RegisterSW />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
