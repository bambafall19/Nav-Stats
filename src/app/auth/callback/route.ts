import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_REDIRECT_PATHS = [
  '/',
  '/pronostics',
  '/classements',
  '/matchs',
  '/statistiques',
  '/communaute',
  '/profil',
]

function sanitizePath(next: string): string {
  try {
    // Accepter uniquement les chemins relatifs commençant par /
    if (!next.startsWith('/')) return '/'
    // Bloquer les redirections vers des domaines externes
    const url = new URL(next, 'http://localhost')
    const path = url.pathname
    // Vérifier que le chemin est dans la liste autorisée ou commence par un chemin autorisé
    const isAllowed = ALLOWED_REDIRECT_PATHS.some(p => path === p || path.startsWith(p + '/'))
    return isAllowed ? path : '/'
  } catch {
    return '/'
  }
}

function buildRedirectUrl(request: Request, path: string): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    return new URL(path, siteUrl)
  }
  // En dev, utiliser l'origin de la requête (sûr car c'est localhost)
  const requestUrl = new URL(request.url)
  const base = `${requestUrl.protocol}//${requestUrl.host}`
  return new URL(path, base)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/'
  const next = sanitizePath(rawNext)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(buildRedirectUrl(request, next))
    }
  }

  return NextResponse.redirect(buildRedirectUrl(request, '/auth/login?error=auth-code-error'))
}
