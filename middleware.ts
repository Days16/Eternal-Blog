import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // get role from users table
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
    const role = (profile as { role?: string } | null)?.role ?? null
    if (role !== 'admin' && role !== 'moderator' && role !== 'dev') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    if (role === 'moderator') {
      const isAllowed = pathname === '/admin' || pathname.startsWith('/admin/entradas') || pathname.startsWith('/admin/comentarios')
      if (!isAllowed) return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  if (pathname.startsWith('/perfil/editar') && !user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/tienda/carrito') && !user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/editar/:path*', '/tienda/carrito/:path*'],
}
