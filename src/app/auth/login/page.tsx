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
      background: 'linear-gradient(135deg, #00A651 0%, #006233 40%, #003d1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-outfit), system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        filter: 'blur(60px)',
        animation: 'float 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-15%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)',
        filter: 'blur(50px)',
        animation: 'float 8s ease-in-out infinite reverse',
      }} />

      {/* Header */}
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
          color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 700,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }} onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.transform = 'scale(1)';
        }}>
          ‹
        </Link>
        
        <Link href="/auth/register" style={{
          background: 'rgba(255,255,255,0.95)', color: '#006233',
          padding: '10px 18px', borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}>
          S'inscrire
        </Link>
      </div>

      {/* Main content - Centered */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 5,
      }}>
        {/* Logo and branding */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 40,
          animation: 'slideUp 0.6s ease-out',
        }}>
          <div style={{
            width: 70,
            height: 70,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
            animation: 'pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <img src="/logo.png" alt="NavéStats Logo" style={{ width: 50, height: 50 }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-outfit)',
            fontWeight: 800,
            fontSize: '2rem',
            color: 'white',
            letterSpacing: '-0.02em',
            margin: 0,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            NavéStats
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.9rem',
            fontWeight: 500,
            margin: 0,
            textAlign: 'center',
          }}>
            Pronostique • Domine • Partage
          </p>
        </div>

        {/* Main card */}
        <div style={{
          width: '100%',
          maxWidth: 380,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), inset 1px 1px 0 rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.3)',
          animation: 'slideUp 0.8s ease-out 0.1s backwards',
        }}>
        {/* Form container to control width and layout */}
        <div style={{ width: '100%' }}
          {/* Title */}
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'var(--font-outfit)',
              fontWeight: 800,
              fontSize: '1.5rem',
              color: '#1a1a2e',
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}>
              Bon retour ! 👋
            </h2>
            <p style={{
              color: '#666',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              margin: 0,
            }}>
              Connecte-toi pour partager tes pronostics
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Identifier field */}
            <div style={{
              marginBottom: 16,
              animation: 'slideUp 0.8s ease-out 0.2s backwards',
            }}>
              <label style={{
                fontSize: '0.7rem',
                color: '#666',
                fontWeight: 700,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
                Téléphone ou Email
              </label>
              <input
                id="identifier-input"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="771234567 ou email@..."
                required
                autoComplete="username"
                style={{
                  border: '2px solid #e0e0e0',
                  outline: 'none',
                  background: '#f8f9fb',
                  width: '100%',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#1a1a2e',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-outfit)',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }} onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00A651';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 166, 81, 0.1)';
                  e.currentTarget.style.background = 'white';
                }} onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#f8f9fb';
                }} />
            </div>

            {/* Password field */}
            <div style={{
              marginBottom: 18,
              animation: 'slideUp 0.8s ease-out 0.3s backwards',
            }}>
              <label style={{
                fontSize: '0.7rem',
                color: '#666',
                fontWeight: 700,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
                Mot de passe
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    border: '2px solid #e0e0e0',
                    outline: 'none',
                    background: '#f8f9fb',
                    width: '100%',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#1a1a2e',
                    padding: '12px 14px',
                    paddingRight: '40px',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-outfit)',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }} onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#00A651';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 166, 81, 0.1)';
                    e.currentTarget.style.background = 'white';
                  }} onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = '#f8f9fb';
                  }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    padding: '0',
                    color: '#999',
                    transition: 'color 0.2s ease',
                  }} onMouseEnter={(e) => e.currentTarget.style.color = '#00A651'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'} >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(232,0,45,0.08) 0%, rgba(232,0,45,0.04) 100%)',
                border: '1.5px solid #ff6b6b',
                borderRadius: 12,
                color: '#e82828',
                fontSize: '0.8rem',
                marginBottom: 16,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                animation: 'slideUp 0.4s ease-out',
              }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-btn"
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '12px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #00A651 0%, #008c3f 100%)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                fontFamily: 'var(--font-outfit)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(0, 166, 81, 0.25)',
                marginBottom: 14,
                transition: 'all 0.3s ease',
                animation: 'slideUp 0.8s ease-out 0.4s backwards',
              }} onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 166, 81, 0.35)';
                }
              }} onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 166, 81, 0.25)';
                }
              }} >
              {loading ? '⏳ Connexion...' : '🚀 Se connecter'}
            </button>

            {/* Forgot link */}
            <div style={{
              textAlign: 'center',
              marginBottom: 20,
              animation: 'slideUp 0.8s ease-out 0.5s backwards',
            }}>
              <Link href="#" style={{
                color: '#00A651',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }} onMouseEnter={(e) => e.currentTarget.style.color = '#006233'} onMouseLeave={(e) => e.currentTarget.style.color = '#00A651'} >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Social Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
              animation: 'slideUp 0.8s ease-out 0.6s backwards',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
              <span style={{
                fontSize: '0.65rem',
                color: '#999',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>Ou continuer avec</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
            </div>

            {/* Social buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              animation: 'slideUp 0.8s ease-out 0.7s backwards',
            }}>
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px',
                  borderRadius: '12px',
                  background: '#f5f5f5',
                  border: '1.5px solid #e0e0e0',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-outfit)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#00A651';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 166, 81, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: 16, height: 16 }} />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('facebook')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px',
                  borderRadius: '12px',
                  background: '#f5f5f5',
                  border: '1.5px solid #e0e0e0',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-outfit)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#00A651';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 166, 81, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontWeight: 700 }}>f</span>
                Facebook
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }
        
        @keyframes pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
