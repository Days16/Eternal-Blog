export function apiError(message: string, raw: unknown, status = 500): Response {
  const body =
    process.env.NODE_ENV === 'development'
      ? { error: message, details: raw }
      : { error: message }
  return Response.json(body, { status })
}

type RouteHandler<Ctx> = (req: Request, ctx: Ctx) => Promise<Response>

// Captura rechazos transitorios (p. ej. fallos de red hacia Supabase) que de
// otro modo se convertirían en un 500 sin cuerpo; el 503 señala "reintenta".
export function withRouteErrors<Ctx = unknown>(route: string, handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      console.error(`[api:${route}]`, err instanceof Error ? err.message : err)
      return apiError('Servicio no disponible. Inténtalo de nuevo.', err, 503)
    }
  }
}
