'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Eye, EyeOff, User, Lock } from 'lucide-react'
import styles from './login.module.css'

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

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    if (isPhoneNumber(loginEmail)) loginEmail = buildPhoneEmail(loginEmail)
    const { error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
    if (err) { setError('Identifiant ou mot de passe incorrect.'); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (err) {
      const message = err.message.toLowerCase().includes('unsupported provider')
        ? `La connexion avec ${provider === 'google' ? 'Google' : 'Facebook'} n'est pas encore activée.`
        : err.message
      setError(message); setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true); setResetError(''); setResetSent(false)
    let targetEmail = resetEmail.trim()
    if (isPhoneNumber(targetEmail)) targetEmail = buildPhoneEmail(targetEmail)
    const { error: err } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (err) {
      setResetError(err.message.toLowerCase().includes('rate limit') ? "Trop de tentatives. Patientez quelques minutes." : err.message)
      setResetLoading(false); return
    }
    setResetSent(true); setResetLoading(false)
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
        <Link href="/auth/register" className={styles.registerPill}>
          Créer un compte
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
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Bon retour 👋</h2>
          <p className={styles.welcomeSubtitle}>
            Connectez-vous pour suivre les scores, statistiques et actualités de votre ASC.
          </p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.fieldGroup}>
            <div className={styles.inputWrap}>
              <User size={20} className={styles.inputIcon} />
              <input
                id="identifier-input"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="ex : diallo_foot ou email@gmail.com"
                required
                autoComplete="username"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.inputWrap}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                autoComplete="current-password"
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
          </div>

          <div className={styles.optionsRow}>
            <label className={styles.rememberLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Se souvenir de moi</span>
            </label>
            <button type="button" onClick={() => setShowResetModal(true)} className={styles.forgotLink}>
              Mot de passe oublié ?
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            id="login-btn"
            className={`${styles.submitButton} ${loading ? styles.submitButtonDisabled : styles.submitButtonActive}`}
          >
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
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
        <span className={styles.footerText}>Vous n&apos;avez pas de compte ?</span>
        <Link href="/auth/register" className={styles.footerLink}>Créer un compte →</Link>
      </footer>

      {showResetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowResetModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            {!resetSent ? (
              <>
                <h3 className={styles.modalTitle}>Mot de passe oublié</h3>
                <p className={styles.modalSubtitle}>Saisis ton email ou ton numéro pour recevoir un lien de réinitialisation.</p>
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
                  {resetError && <div className={styles.errorMessage} style={{ marginBottom: 16 }}>{resetError}</div>}
                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setShowResetModal(false)} className={styles.modalCancelButton}>Annuler</button>
                    <button type="submit" disabled={resetLoading} className={styles.modalSubmitButton}>{resetLoading ? 'Envoi...' : 'Envoyer le lien'}</button>
                  </div>
                </form>
              </>
            ) : (
              <div className={styles.modalSuccess}>
                <h3 className={styles.modalSuccessTitle}>Email envoyé !</h3>
                <p className={styles.modalSuccessText}>Un lien de réinitialisation a été envoyé. Vérifie ta boîte de réception.</p>
                <button type="button" onClick={() => setShowResetModal(false)} className={styles.modalSubmitButton} style={{ width: '100%' }}>Compris</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
