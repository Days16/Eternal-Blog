import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      // Los tests que usan DOMPurify o React necesitan jsdom
      ['**/__tests__/**/*.test.tsx', 'jsdom'],
      ['**/__tests__/**/sanitize.test.ts', 'jsdom'],
    ],
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    setupFiles: ['__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // Stub de módulos Next.js que no existen en entorno de test
      'next/cache':      path.resolve(__dirname, '__tests__/__mocks__/next-cache.ts'),
      'next/headers':    path.resolve(__dirname, '__tests__/__mocks__/next-headers.ts'),
      'next/navigation': path.resolve(__dirname, '__tests__/__mocks__/next-navigation.ts'),
      'next/server':     path.resolve(__dirname, '__tests__/__mocks__/next-server.ts'),
    },
  },
})
