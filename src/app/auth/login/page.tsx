'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)

  // Dark mode init from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('navestats-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved === 'dark' || (!saved && prefersDark)
    setIsDark(dark)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('navestats-theme', next ? 'dark' : 'light')
  }

  // Password reset modal state
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState('')

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

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true); setResetError(''); setResetSent(false)

    let targetEmail = resetEmail.trim()
    if (isPhoneNumber(targetEmail)) {
      targetEmail = buildPhoneEmail(targetEmail)
    }

    const { error: err } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (err) {
      setResetError(
        err.message.toLowerCase().includes('rate limit')
          ? "Trop de tentatives. Patientez quelques minutes puis réessayez."
          : err.message
      )
      setResetLoading(false)
      return
    }

    setResetSent(true)
    setResetLoading(false)
  }

  function openResetModal() {
    setShowResetModal(true)
    setResetEmail('')
    setResetSent(false)
    setResetError('')
  }

  function closeResetModal() {
    setShowResetModal(false)
    setResetEmail('')
    setResetSent(false)
    setResetError('')
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" className={styles.backButton}>
            ‹
          </Link>
          <button
            onClick={toggleDark}
            className={styles.themeToggle}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <Link href="/auth/register" className={styles.registerLink}>
          S'inscrire
        </Link>
      </div>

      <div className={styles.main}>
        <div className={styles.authShell}>
          <section className={styles.heroPanel} aria-label="Présentation NavéStats">
            <div className={styles.partnerBadge}>
              <img src="/oncav-logo.png" alt="ONCAV Zone 6" />
              <span>Zone 6 Khombole</span>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.logoContainer}>
                <img src="/logo.png" alt="NavéStats Logo" className={styles.logo} />
              </div>
              <p className={styles.kicker}>Navétanes 2026</p>
              <h1 className={styles.brandTitle}>Connecte-toi à NavéStats</h1>
              <p className={styles.brandSubtitle}>
                Retrouve tes pronostics, suis ton classement et reste dans le rythme des matchs de Khombole.
              </p>
            </div>

            <div className={styles.insightGrid} aria-label="Aperçu rapide">
              <div>
                <strong>1X2</strong>
                <span>Pronostics rapides</span>
              </div>
              <div>
                <strong>Live</strong>
                <span>Matchs à suivre</span>
              </div>
              <div>
                <strong>Top</strong>
                <span>Classement joueurs</span>
              </div>
            </div>
          </section>

          <section className={styles.card} aria-label="Connexion">
            <div className={styles.formContainer}>
              <div className={styles.sectionTitle}>
                <p>Bon retour</p>
                <h2>Connexion</h2>
                <span>Entre ton téléphone ou ton email pour continuer.</span>
              </div>

            <form onSubmit={handleLogin} className={styles.form}>
              {/* Identifier field */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="identifier-input">
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
                  className={styles.input}
                />
              </div>

              {/* Password field */}
              <div className={styles.fieldGroupPassword}>
                <label className={styles.fieldLabel} htmlFor="password-input">
                  Mot de passe
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className={styles.inputPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="login-btn"
                className={`${styles.submitButton} ${loading ? styles.submitButtonDisabled : styles.submitButtonActive}`}
              >
                {loading ? '⏳ Connexion...' : '🚀 Se connecter'}
              </button>

              {/* Forgot link */}
              <div className={styles.fieldGroupForgot}>
                <button
                  type="button"
                  onClick={openResetModal}
                  className={styles.forgotLink}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-outfit)' }}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Social Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>Ou continuer avec</span>
                <div className={styles.dividerLine} />
              </div>

              {/* Social buttons */}
              <div className={styles.socialGrid}>
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="G"
                    className={styles.socialIcon}
                  />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('facebook')}
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <span className={styles.socialIconFb}>f</span>
                  Facebook
                </button>
              </div>
            </form>
            </div>
          </section>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className={styles.modalOverlay} onClick={closeResetModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            {!resetSent ? (
              <>
                <h3 className={styles.modalTitle}>🔑 Mot de passe oublié</h3>
                <p className={styles.modalSubtitle}>
                  Saisis ton email ou ton numéro de téléphone pour recevoir un lien de réinitialisation.
                </p>

                <form onSubmit={handleResetPassword}>
                  <input
                    type="text"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="771234567 ou email@..."
                    required
                    autoComplete="email"
                    className={styles.modalInput}
                  />

                  {resetError && (
                    <div className={styles.errorMessage} style={{ marginBottom: 16 }}>
                      <span className={styles.errorIcon}>⚠️</span>
                      {resetError}
                    </div>
                  )}

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={closeResetModal}
                      className={styles.modalCancelButton}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className={styles.modalSubmitButton}
                    >
                      {resetLoading ? '⏳ Envoi...' : '📩 Envoyer le lien'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className={styles.modalSuccess}>
                <div className={styles.modalSuccessIcon}>✅</div>
                <h3 className={styles.modalSuccessTitle}>Email envoyé !</h3>
                <p className={styles.modalSuccessText}>
                  Un lien de réinitialisation a été envoyé. Vérifie ta boîte de réception (et tes spams).
                </p>
                <button
                  type="button"
                  onClick={closeResetModal}
                  className={styles.modalSubmitButton}
                  style={{ width: '100%' }}
                >
                  Compris 👍
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
