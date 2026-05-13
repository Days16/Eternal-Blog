import { vi } from 'vitest'

export const redirect  = vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) })
export const notFound  = vi.fn(() => { throw new Error('NEXT_NOT_FOUND') })
export const useRouter = vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }))
export const usePathname = vi.fn(() => '/')
export const useSearchParams = vi.fn(() => new URLSearchParams())
