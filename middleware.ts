import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const role = token?.role

  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/perfil/editar')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/editar/:path*'],
}
