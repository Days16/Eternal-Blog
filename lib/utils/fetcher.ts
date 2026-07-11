export class FetchError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'FetchError'
    this.status = status
  }
}

export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new FetchError(`Request failed (${res.status}): ${url}`, res.status)
  return res.json() as Promise<T>
}
