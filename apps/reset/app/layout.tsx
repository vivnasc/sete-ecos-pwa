import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import RegisterSW from '@/components/RegisterSW'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthGate } from '@/components/AuthGate'
import OnboardingGate from '@/components/OnboardingGate'
import QuickLog from '@/components/QuickLog'
import InstallPrompt from '@/components/InstallPrompt'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthGate>
            <OnboardingGate>
              <main className="container-app pb-32 pt-4 sm:pt-8">{children}</main>
              <Navigation />
              <QuickLog />
              <InstallPrompt />
            </OnboardingGate>
          </AuthGate>
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  )
}
