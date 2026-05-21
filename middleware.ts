import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  // La tienda está oculta hasta que el admin la active vía site_settings.
  // Como el middleware no puede hacer queries async a Supabase, la protección
  // real la hace la página /tienda (Server Component) redirigiendo a notFound().
  // Aquí solo protegemos /tienda de usuarios no autenticados si lo deseas.

  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (role !== 'admin' && role !== 'moderator' && role !== 'dev') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (role === 'moderator') {
      const isAllowedModRoute =
        pathname === '/admin' ||
        pathname.startsWith('/admin/entradas') ||
        pathname.startsWith('/admin/comentarios')

      if (!isAllowedModRoute) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }
  }

  if (pathname.startsWith('/perfil/editar')) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/perfil/editar/:path*', '/tienda/:path*'],
}
