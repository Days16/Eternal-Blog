import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ETERNIDAD',
    short_name: 'Eternidad',
    description: 'Blog-wiki de un escritor en formación. Crónicas, Codex y comunidad.',
    start_url: '/cronicas',
    display: 'standalone',
    background_color: '#0b1119',
    theme_color: '#d4a64a',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['books', 'entertainment'],
    lang: 'es',
  }
}
