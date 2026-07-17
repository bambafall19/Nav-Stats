import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SAFE_REDIRECT_PATHS: Record<string, string> = {
  '/admin': '/auth/login',
  '/pronostics': '/auth/login?redirect=/pronostics',
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  for (const [protectedPath, loginPath] of Object.entries(SAFE_REDIRECT_PATHS)) {
    if (request.nextUrl.pathname.startsWith(protectedPath) && !user) {
      return NextResponse.redirect(new URL(loginPath, SITE_URL))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
