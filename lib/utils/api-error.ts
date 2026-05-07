export function apiError(message: string, raw: unknown, status = 500): Response {
  const body =
    process.env.NODE_ENV === 'development'
      ? { error: message, details: raw }
      : { error: message }
  return Response.json(body, { status })
}
