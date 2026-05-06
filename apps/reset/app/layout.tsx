import type { Metadata, Viewport } from 'next'
import { Lora, Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import RegisterSW from '@/components/RegisterSW'
import './globals.css'

const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Reset · 60 dias',
  description: 'Companheira de jornada · 11 maio – 9 julho 2026',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Reset'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
}

export const viewport: Viewport = {
  themeColor: '#F8F4EC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${lora.variable} ${inter.variable}`}>
      <body>
        <main className="container-app pb-28 pt-6 sm:pt-10">{children}</main>
        <Navigation />
        <RegisterSW />
      </body>
    </html>
  )
}
