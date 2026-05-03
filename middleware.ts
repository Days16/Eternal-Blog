import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export default async function middleware(req: Request & { nextUrl: URL; url: string }) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const role = token?.role

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/perfil/editar')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/editar/:path*'],
}
