import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    level?: number
    xp?: number
    role?: string
    username?: string | null
  }
  interface Session {
    user: {
      id: string
      level: number
      xp: number
      role: string
      username: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    level?: number
    xp?: number
    role?: string
    username?: string | null
  }
}
