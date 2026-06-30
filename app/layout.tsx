import type { Metadata } from 'next'
import { Cormorant_Garamond, Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/Providers'
import { ChatWidget } from '@/components/social/ChatWidget'
import { getSession } from '@/lib/auth/session'
import '@/styles/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ETERNIDAD',
    template: '%s · ETERNIDAD',
  },
  description: 'Bitácora arcana de un escritor en formación. Crónicas, Codex y mundos en construcción.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'),
  icons: {
    icon: [{ url: '/icon-192.png', type: 'image/png', sizes: '192x192' }],
    apple: [{ url: '/icon-192.png', type: 'image/png', sizes: '192x192' }],
    shortcut: '/icon-192.png',
  },
  openGraph: {
    siteName: 'ETERNIDAD',
    type: 'website',
    locale: 'es_ES',
  },
  alternates: {
    types: {
      'application/atom+xml': '/feed.xml',
    },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="tex-canopy tex-grain">
        <Providers session={session}>{children}</Providers>
        {session?.user?.id && <ChatWidget currentUserId={session.user.id} />}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  )
}
