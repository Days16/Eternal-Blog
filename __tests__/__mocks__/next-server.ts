import { vi } from 'vitest'

export const NextResponse = {
  json:     vi.fn((data: unknown, init?: ResponseInit) => ({ data, init })),
  redirect: vi.fn((url: string) => ({ url })),
  next:     vi.fn(() => ({})),
}

export class NextRequest {
  url: string
  method: string
  constructor(url: string, init?: RequestInit) {
    this.url = url
    this.method = init?.method ?? 'GET'
  }
  async json() { return {} }
}
