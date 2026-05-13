import { vi } from 'vitest'

export const headers  = vi.fn(async () => new Map())
export const cookies  = vi.fn(async () => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }))
