import type { Metadata } from 'next'
import { Cormorant_Garamond, Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="tex-canopy tex-grain">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
