'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import FormSubmitButton from '@/components/shared/FormSubmitButton'
import LinkButton from '@/components/shared/LinkButton'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient() as any
  const [form, setForm] = useState({ username: '', full_name: '', phone: '', email: '', password: '', quartier: '', asc_nom: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  function update(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function isPhoneNumber(val: string) {
    const clean = val.replace(/[\s\-\+\(\)]/g, '')
    return /^\d{7,15}$/.test(clean)
  }

  function buildPhoneEmail(phone: string) {
    const normalizedPhone = phone.replace(/\D/g, '')
    return `user-${normalizedPhone}@navestats.app`
  }

  function detectOperator(phone: string) {
    const clean = phone.replace(/[\s\-\+\(\)]/g, '')
    if (/^(77|78)/.test(clean)) return { name: 'Orange', color: '#FF6600', icon: '🍊' }
    if (/^(76)/.test(clean)) return { name: 'Free', color: '#E30613', icon: '🔴' }
    if (/^(70)/.test(clean)) return { name: 'Expresso', color: '#009EE0', icon: '🔵' }
    if (/^(75)/.test(clean)) return { name: 'Promobile', color: '#8CC63F', icon: '🟢' }
    return null
  }

  function getPasswordStrength(pwd: string) {
    if (!pwd) return { score: 0, label: '', color: '#E2E8F0' }
    let score = 0
    if (pwd.length >= 6) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++
    
    if (score === 1) return { score: 1, label: 'Faible', color: '#E8002D' }
    if (score === 2) return { score: 2, label: 'Moyen', color: '#FBBF00' }
    if (score === 3) return { score: 3, label: 'Fort', color: '#00A651' }
    return { score: 0, label: '', color: '#E2E8F0' }
  }

  const operator = detectOperator(form.phone)
  const strength = getPasswordStrength(form.password)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    // Validate phone number
    const cleanPhone = form.phone.trim().replace(/\D/g, '')
    if (!isPhoneNumber(cleanPhone)) {
      setError('Veuillez entrer un numéro de téléphone valide (ex: 771234567).')
      setLoading(false)
      return
    }

    // Determine registration email
    let regEmail = form.email.trim()
    if (!regEmail) {
      regEmail = buildPhoneEmail(cleanPhone)
    }

    const { data, error: err } = await supabase.auth.signUp({
      email: regEmail,
      password: form.password,
      options: {
        data: {
          username: form.username,
          full_name: form.full_name,
          phone: cleanPhone,
        }
      }
    })

    if (err) {
      const lowerMessage = err.message.toLowerCase()
      const message = lowerMessage.includes('rate limit')
        ? "Trop de tentatives d'inscription en peu de temps. Patiente quelques minutes puis réessaie."
        : err.message.includes('Email address')
          ? "L'inscription par téléphone a échoué. Ajoutez un email valide ou réessayez avec un autre numéro."
          : err.message
      setError(message)
      setLoading(false)
      return
    }

    // Update profile with quartier/asc
    if (data.user) {
      await supabase.from('profiles').update({
        quartier: form.quartier,
        asc_nom: form.asc_nom,
      }).eq('id', data.user.id)
    }

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
        ? `La connexion avec ${provider === 'google' ? 'Google' : 'Facebook'} n'est pas encore activée. Crée ton compte avec téléphone/mot de passe ou active ce fournisseur dans Supabase.`
        : err.message
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-outfit), system-ui, sans-serif',
      transition: 'background 0.3s ease',
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
        {/* Top actions inside header */}
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
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Déjà inscrit ?</span>
            <Link href="/auth/login" style={{
              background: 'var(--color-surface-card)', color: 'var(--color-primary)',
              padding: '5px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            }}>
              Se connecter
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
        background: 'var(--color-surface-card)',
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
        padding: '28px 20px',
        boxShadow: 'var(--shadow-md)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.3s ease',
      }}>
        {/* Form container to control width and layout */}
        <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 'var(--radius-full)',
                background: s <= step ? 'var(--color-primary-light)' : 'var(--color-border)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
            {step === 1 && (
              <>
                {/* Title Step 1 */}
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--color-text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                    Créer un compte
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    Étape 1 sur 2 : Informations personnelles
                  </p>
                </div>

                {/* Username field */}
                <div style={{
                  position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
                  padding: '8px 14px 6px', marginBottom: 12,
                }}>
                  <label style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                    Nom d'utilisateur *
                  </label>
                  <input
                    id="username-input" type="text" value={form.username} onChange={e => update('username', e.target.value)} required
                    placeholder="ex: diallo_foot"
                    style={{
                      border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem',
                      fontWeight: 500, color: 'var(--color-text-primary)', padding: 0, fontFamily: 'var(--font-outfit)',
                    }}
                  />
                </div>

                {/* Fullname field */}
                <div style={{
                  position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
                  padding: '8px 14px 6px', marginBottom: 12,
                }}>
                  <label style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                    Nom complet
                  </label>
                  <input
                    id="fullname-input" type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                    placeholder="ex: Moussa Diallo"
                    style={{
                      border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem',
                      fontWeight: 500, color: 'var(--color-text-primary)', padding: 0, fontFamily: 'var(--font-outfit)',
                    }}
                  />
                </div>

                {/* Quartier field */}
                <div style={{
                  position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
                  padding: '8px 14px 6px', marginBottom: 12,
                }}>
                  <label style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                    Quartier
                  </label>
                  <select
                    id="quartier-select" value={form.quartier} onChange={e => update('quartier', e.target.value)}
                    style={{
                      border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem',
                      fontWeight: 500, color: 'var(--color-text-primary)', padding: 0, fontFamily: 'var(--font-outfit)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled style={{ background: 'var(--color-surface-card)', color: 'var(--color-text-muted)' }}>Choisir un quartier...</option>
                    {['Escale', 'Hannene', 'Ngandiol', 'Ngaye', 'Thilla', 'Kairé', 'Keur macodou', 'Guinnaw Rail', 'Niobene', 'Ndiayene Guouye', 'Diokoul'].map(q => (
                      <option key={q} value={q} style={{ background: 'var(--color-surface-card)', color: 'var(--color-text-primary)' }}>{q}</option>
                    ))}
                  </select>
                </div>

                {/* ASC field */}
                <div style={{
                  position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
                  padding: '8px 14px 6px', marginBottom: 20,
                }}>
                  <label style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                    ASC soutenue
                  </label>
                  <input
                    id="asc-input" type="text" value={form.asc_nom} onChange={e => update('asc_nom', e.target.value)}
                    placeholder="ex: ASC Book Joom"
                    style={{
                      border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem',
                      fontWeight: 500, color: 'var(--color-text-primary)', padding: 0, fontFamily: 'var(--font-outfit)',
                    }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-full)', background: 'var(--gradient-green)', fontWeight: 700, fontFamily: 'var(--font-outfit)', boxShadow: 'var(--shadow-green)' }} id="next-step-btn">
                  Suivant →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Title Step 2 */}
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--color-text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                    Informations d'accès
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    Étape 2 sur 2 : Numéro & mot de passe
                  </p>
                </div>

                 {/* Phone field */}
                <div style={{
                  position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
                  padding: '8px 14px 6px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                      Numéro de téléphone *
                    </label>
                    <input
                      id="phone-reg-input" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} required
                      placeholder="ex: 771234567"
                      style={{
                        border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem',
                        fontWeight: 500, color: 'var(--color-text-primary)', padding: 0, fontFamily: 'var(--font-outfit)',
                      }}
                    />
                  </div>
                  {operator && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 800, color: operator.color,
                      background: 'var(--color-surface-card)', padding: '3px 8px', borderRadius: 6,
                      border: `1px solid ${operator.color}40`, display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      {operator.icon} {operator.name}
                    </span>
                  )}
                </div>

                {/* Email field */}
                <div style={{
                  position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
                  padding: '8px 14px 6px', marginBottom: 12,
                }}>
                  <label style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                    Email (Optionnel)
                  </label>
                  <input
                    id="email-reg-input" type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="votre@email.com (facultatif)"
                    style={{
                      border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem',
                      fontWeight: 500, color: 'var(--color-text-primary)', padding: 0, fontFamily: 'var(--font-outfit)',
                    }}
                  />
                </div>

                {/* Password field */}
                <div style={{
                  position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
                  padding: '8px 14px 6px', marginBottom: strength.label ? 8 : 20,
                }}>
                  <label style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                    Mot de passe *
                  </label>
                  <input
                    id="password-reg-input" type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6}
                    placeholder="Minimum 6 caractères"
                    style={{
                      border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem',
                      fontWeight: 500, color: 'var(--color-text-primary)', padding: 0, fontFamily: 'var(--font-outfit)',
                    }}
                  />
                </div>

                {/* Password strength indicator */}
                {strength.label && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '0 4px' }}>
                    <div style={{ flex: 1, display: 'flex', gap: 4, height: 4 }}>
                      {[1, 2, 3].map(seg => (
                        <div key={seg} style={{
                          flex: 1, height: '100%', borderRadius: 2,
                          background: seg <= strength.score ? strength.color : 'var(--color-border)',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                {error && (
                  <div style={{ padding: '12px 14px', background: 'rgba(232,0,45,0.06)', border: '1px solid rgba(232,0,45,0.12)', borderRadius: 10, color: 'var(--color-red)', fontSize: '0.8rem', marginBottom: 16, fontWeight: 500 }}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-full)', background: 'transparent', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-outfit)' }}>
                    ← Retour
                  </button>
                  <div style={{ flex: 2 }}>
                    <FormSubmitButton loading={loading} icon="✨" loadingIcon="⏳" loadingText="Création...">
                      Créer le compte
                    </FormSubmitButton>
                  </div>
                </div>
              </>
            )}

            {/* Social Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, marginTop: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ou s'inscrire avec</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
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
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', cursor: 'pointer',
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
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', cursor: 'pointer',
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
