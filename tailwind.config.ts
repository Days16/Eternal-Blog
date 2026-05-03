import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta moss (añil-pizarra)
        'moss-950': 'var(--moss-950)',
        'moss-900': 'var(--moss-900)',
        'moss-800': 'var(--moss-800)',
        'moss-700': 'var(--moss-700)',
        'moss-600': 'var(--moss-600)',
        'moss-500': 'var(--moss-500)',
        'moss-400': 'var(--moss-400)',
        'moss-300': 'var(--moss-300)',
        'moss-200': 'var(--moss-200)',
        'moss-100': 'var(--moss-100)',
        // Pergamino
        'vellum-50':  'var(--vellum-50)',
        'vellum-100': 'var(--vellum-100)',
        'vellum-200': 'var(--vellum-200)',
        'vellum-700': 'var(--vellum-700)',
        'vellum-900': 'var(--vellum-900)',
        // Acentos
        spore:     'var(--spore)',
        'spore-dim':  'var(--spore-dim)',
        rune:      'var(--rune)',
        'rune-dim':   'var(--rune-dim)',
        ember:     'var(--ember)',
        mist:      'var(--mist)',
        amethyst:  'var(--amethyst)',
        // Semánticos
        bg:        'var(--bg)',
        'bg-elev':    'var(--bg-elev)',
        'bg-card':    'var(--bg-card)',
        border:    'var(--border)',
        text:      'var(--text)',
        'text-soft':  'var(--text-soft)',
        'text-mute':  'var(--text-mute)',
        accent:    'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
        ui:      ['var(--font-ui)'],
        mono:    ['var(--font-mono)'],
        rune:    ['var(--font-rune)'],
      },
      spacing: {
        's1': 'var(--s-1)',
        's2': 'var(--s-2)',
        's3': 'var(--s-3)',
        's4': 'var(--s-4)',
        's5': 'var(--s-5)',
        's6': 'var(--s-6)',
        's7': 'var(--s-7)',
        's8': 'var(--s-8)',
        's9': 'var(--s-9)',
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        sm:       'var(--shadow-sm)',
        md:       'var(--shadow-md)',
        lg:       'var(--shadow-lg)',
        'glow-spore': 'var(--glow-spore)',
      },
      transitionTimingFunction: {
        'ease-arcana': 'var(--ease)',
      },
    },
  },
  plugins: [],
}

export default config
