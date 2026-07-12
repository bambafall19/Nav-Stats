'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function isPhoneNumber(val: string) {
    const clean = val.replace(/[\s\-\+\(\)]/g, '')
    return /^\d{7,15}$/.test(clean)
  }

  function buildPhoneEmail(phone: string) {
    const normalizedPhone = phone.replace(/\D/g, '')
    return `user-${normalizedPhone}@navestats.app`
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    
    let loginEmail = identifier.trim()
    if (isPhoneNumber(loginEmail)) {
      loginEmail = buildPhoneEmail(loginEmail)
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
    if (err) { setError('Identifiant ou mot de passe incorrect.'); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (err) {
      const message = err.message.toLowerCase().includes('unsupported provider')
        ? `La connexion avec ${provider === 'google' ? 'Google' : 'Facebook'} n'est pas encore activée. Utilise ton téléphone/mot de passe ou active ce fournisseur dans Supabase.`
        : err.message
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-outfit), system-ui, sans-serif',
    }}>
      {/* Top Header - Curved green header */}
      <div style={{
        background: 'linear-gradient(135deg, #00A651 0%, #006233 100%)',
        height: '200px', // slightly smaller header
        padding: '32px 20px 0',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        boxShadow: '0 8px 24px rgba(0, 98, 51, 0.12)',
      }}>
        {/* Top actions */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: 'white', textDecoration: 'none', fontSize: '1rem', fontWeight: 700,
          }}>
            ‹
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Pas de compte ?</span>
            <Link href="/auth/register" style={{
              background: 'white', color: '#006233',
              padding: '5px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            }}>
              S'inscrire
            </Link>
          </div>
        </div>

        {/* Center Brand Text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 35 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="NavéStats Logo" style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid white' }} />
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.7rem', color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
              NavéStats
            </h1>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div style={{
        flex: 1,
        marginTop: '-20px',
        background: 'white',
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
        padding: '28px 20px',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.02)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Form container to control width and layout */}
        <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ marginBottom: 24, textAlign: 'left' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.6rem', color: '#0F172A', marginBottom: 4, letterSpacing: '-0.02em' }}>
              Bon retour !
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.4 }}>
              Entrez vos coordonnées de connexion ci-dessous
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Identifier field */}
            <div style={{
              position: 'relative',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '8px 14px 6px',
              marginBottom: 14,
            }}>
              <label style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                Numéro de téléphone ou Email
              </label>
              <input
                id="identifier-input"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="ex: 771234567"
                required
                autoComplete="username"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#0F172A',
                  padding: 0,
                  fontFamily: 'var(--font-outfit)',
                }}
              />
            </div>

            {/* Password field */}
            <div style={{
              position: 'relative',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '8px 14px 6px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                  Mot de passe
                </label>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: '#0F172A',
                    padding: 0,
                    fontFamily: 'var(--font-outfit)',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '2px',
                  color: '#64748B',
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>

            {error && (
              <div style={{ padding: '12px 14px', background: 'rgba(232,0,45,0.06)', border: '1px solid rgba(232,0,45,0.12)', borderRadius: 10, color: 'var(--color-red)', fontSize: '0.8rem', marginBottom: 16, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-btn"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-green)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-outfit)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-green)',
                marginBottom: 16,
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            {/* Forgot link */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Link href="#" style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Social Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ou continuer avec</span>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 'var(--radius-full)',
                  background: '#F8FAFC', border: '1px solid #E2E8F0',
                  fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: 14, height: 14 }} />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('facebook')}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 'var(--radius-full)',
                  background: '#F8FAFC', border: '1px solid #E2E8F0',
                  fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                <span style={{ color: '#1877F2', fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>f</span>
                Facebook
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
