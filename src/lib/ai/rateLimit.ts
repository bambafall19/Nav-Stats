type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * Rate limit simple en mémoire (par process).
 * OK pour un seul serveur / dev. Pour multi-instances, passer à Redis plus tard.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { ok: true }
}

export function clientKeyFromRequest(req: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon'
  return `ip:${ip}`
}
