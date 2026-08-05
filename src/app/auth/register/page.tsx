'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, User, UserRound, MapPin, Flag, Phone, Mail, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react'
import styles from './register.module.css'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.931-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

function FootballPattern() {
  return (
    <svg viewBox="0 0 300 300" width={240} height={240} aria-hidden="true" className={styles.football}>
      <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(34,197,94,0.10)" strokeWidth="1.5" />
      <circle cx="150" cy="150" r="86" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <path d="M150 30 L205 105 L185 195 L115 195 L95 105 Z" fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="1.5" />
      <path d="M150 60 C 170 90, 185 130, 185 180" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <path d="M150 60 C 130 90, 115 130, 115 180" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const [form, setForm] = useState({ username: '', full_name: '', phone: '', email: '', password: '', quartier: '', asc_nom: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [ascs, setAscs] = useState<string[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase.from('equipes').select('nom').order('nom')
      if (!active) return
      if (!data) return
      const seen = new Set<string>()
      const list: string[] = []
      for (const row of data) {
        const name = (row.nom || '').trim()
        if (name && !seen.has(name)) {
          seen.add(name)
          list.push(name)
        }
      }
      setAscs(list)
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

    if (score === 1) return { score: 1, label: 'Faible', color: '#FF4D5A' }
    if (score === 2) return { score: 2, label: 'Moyen', color: '#FBBF00' }
    if (score === 3) return { score: 3, label: 'Fort', color: '#22C55E' }
    return { score: 0, label: '', color: '#E2E8F0' }
  }

  const operator = detectOperator(form.phone)
  const strength = getPasswordStrength(form.password)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const cleanPhone = form.phone.trim().replace(/\D/g, '')
    if (!isPhoneNumber(cleanPhone)) {
      setError('Veuillez entrer un numéro de téléphone valide (ex: 771234567).')
      setLoading(false)
      return
    }

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

    if (data.user) {
      await supabase.from('profiles').update({
        quartier: form.quartier,
        asc_nom: form.asc_nom || null,
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
    <div className={styles.page}>
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />
      <FootballPattern />

      <header className={styles.header}>
        <Link href="/" className={styles.backButton} aria-label="Retour">
          <ArrowLeft size={20} color="#FFFFFF" />
        </Link>
        <Link href="/auth/login" className={styles.loginPill}>
          Se connecter
        </Link>
      </header>

      <div className={styles.brand}>
        <img src="/logo.png" alt="NavéStats Logo" className={styles.logo} />
        <h1 className={styles.brandTitle}>
          Navé<span>Stats</span>
        </h1>
        <p className={styles.brandKicker}>KHOMBOLE</p>
      </div>

      <main className={styles.content}>
        <div className={styles.steps}>
          {[1, 2].map(s => (
            <div key={s} className={`${styles.step} ${s <= step ? styles.stepActive : ''}`} />
          ))}
        </div>

        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Créer un compte</h2>
          <p className={styles.subtitle}>
            {step === 1
              ? 'Créez votre profil pour rejoindre la Navétane de Khombole.'
              : 'Dernière étape : numéro & mot de passe.'}
          </p>
        </div>

        <form
          onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleRegister}
          className={styles.form}
        >
          {step === 1 && (
            <>
              <div className={styles.fieldGroup}>
                <div className={styles.inputWrap}>
                  <User size={20} className={styles.inputIcon} />
                  <input
                    id="username-input"
                    type="text"
                    value={form.username}
                    onChange={e => update('username', e.target.value)}
                    required
                    placeholder="ex : diallo_foot"
                    autoComplete="username"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.inputWrap}>
                  <UserRound size={20} className={styles.inputIcon} />
                  <input
                    id="fullname-input"
                    type="text"
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    placeholder="ex : Moussa Diallo"
                    autoComplete="name"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.inputWrap}>
                  <MapPin size={20} className={styles.inputIcon} />
                  <select
                    id="quartier-select"
                    value={form.quartier}
                    onChange={e => update('quartier', e.target.value)}
                    className={`${styles.input} ${styles.select}`}
                  >
                    <option value="" disabled>Choisir un quartier...</option>
                    {['Escale', 'Hannene', 'Ngandiol', 'Ngaye', 'Thilla', 'Kairé', 'Keur macodou', 'Guinnaw Rail', 'Niobene', 'Ndiayene Guouye', 'Diokoul'].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className={styles.selectChevron} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.inputWrap}>
                  <Flag size={20} className={styles.inputIcon} />
                  <select
                    id="asc-input"
                    value={form.asc_nom}
                    onChange={e => update('asc_nom', e.target.value)}
                    className={`${styles.input} ${styles.select}`}
                  >
                    <option value="" disabled>Choisir votre ASC soutenue...</option>
                    {ascs.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className={styles.selectChevron} />
                </div>
              </div>

              <button type="submit" id="next-step-btn" className={`${styles.submitButton} ${styles.submitButtonActive}`}>
                Suivant →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.fieldGroup}>
                <div className={styles.inputWrap}>
                  <Phone size={20} className={styles.inputIcon} />
                  <input
                    id="phone-reg-input"
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    required
                    placeholder="ex : 771234567"
                    autoComplete="tel"
                    className={styles.input}
                  />
                  {operator && (
                    <span className={styles.operatorBadge} style={{ borderColor: `${operator.color}66`, color: operator.color }}>
                      {operator.icon} {operator.name}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.inputWrap}>
                  <Mail size={20} className={styles.inputIcon} />
                  <input
                    id="email-reg-input"
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="votre@email.com (facultatif)"
                    autoComplete="email"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.inputWrap}>
                  <Lock size={20} className={styles.inputIcon} />
                  <input
                    id="password-reg-input"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 caractères"
                    autoComplete="new-password"
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeToggle}
                    aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {strength.label && (
                  <div className={styles.strengthRow}>
                    <div className={styles.strengthBar}>
                      {[1, 2, 3].map(seg => (
                        <div
                          key={seg}
                          className={styles.strengthSeg}
                          style={{ background: seg <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }}
                        />
                      ))}
                    </div>
                    <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.stepActions}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={styles.backStepButton}
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.submitButton} ${loading ? styles.submitButtonDisabled : styles.submitButtonActive}`}
                >
                  {loading ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>ou continuer avec</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.socialGrid}>
          <button type="button" onClick={() => handleOAuth('google')} disabled={loading} className={styles.socialButton}>
            <GoogleIcon /> Google
          </button>
          <button type="button" onClick={() => handleOAuth('facebook')} disabled={loading} className={styles.socialButton}>
            <FacebookIcon /> Facebook
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerText}>Vous avez déjà un compte ?</span>
        <Link href="/auth/login" className={styles.footerLink}>Se connecter →</Link>
      </footer>
    </div>
  )
}
