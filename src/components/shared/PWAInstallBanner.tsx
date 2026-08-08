'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const LS_INSTALLED = 'navestats-pwa-installed'
const SS_SESSION = 'navestats-pwa-session'
const LS_LAST_DISMISSED = 'navestats-pwa-last-dismissed'
const COOLDOWN_MS = 30 * 60 * 1000

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [ready, setReady] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    let onAppInstalled: (() => void) | undefined
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const id = window.setTimeout(() => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setInstalled(true)
        return
      }
      if (localStorage.getItem(LS_INSTALLED)) {
        setInstalled(true)
        return
      }

      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
      const isMobile = ios || /android/i.test(navigator.userAgent)
      if (!isMobile) return

      setIsIOS(ios)
      setReady(true)

      onAppInstalled = () => {
        setInstalled(true)
        setShow(false)
        localStorage.setItem(LS_INSTALLED, '1')
      }
      window.addEventListener('appinstalled', onAppInstalled)

      if (!ios) {
        window.addEventListener('beforeinstallprompt', handler)
      }
    }, 0)

    return () => {
      window.clearTimeout(id)
      window.removeEventListener('beforeinstallprompt', handler)
      if (onAppInstalled) window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const canAutoShow = useCallback(() => {
    if (typeof window === 'undefined') return false
    if (sessionStorage.getItem(SS_SESSION)) return false
    const last = Number(localStorage.getItem(LS_LAST_DISMISSED) || 0)
    if (Date.now() - last < COOLDOWN_MS) return false
    return true
  }, [])

  useEffect(() => {
    if (!ready || installed) return
    if (!canAutoShow()) return
    const t = setTimeout(() => {
      setShow(true)
      sessionStorage.setItem(SS_SESSION, '1')
    }, 2500)
    return () => clearTimeout(t)
  }, [ready, installed, pathname, canAutoShow])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      localStorage.setItem(LS_INSTALLED, '1')
    }
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem(SS_SESSION, '1')
    localStorage.setItem(LS_LAST_DISMISSED, String(Date.now()))
  }

  if (!ready || installed) return null

  return (
    <>
      {/* Pastille persistante au-dessus de la barre de navigation */}
      {!show && (
        <button
          onClick={() => {
            if (deferredPrompt && !isIOS) handleInstall()
            else setShow(true)
          }}
          id="pwa-install-pill"
          aria-label="Installer NavéStats"
          style={{
            position: 'fixed',
            bottom: 'max(86px, calc(env(safe-area-inset-bottom) + 78px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 960,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 999,
            background: 'rgba(17, 17, 17, 0.92)',
            backdropFilter: 'blur(14px) saturate(150%)',
            WebkitBackdropFilter: 'blur(14px) saturate(150%)',
            border: '1px solid rgba(42,255,160,0.25)',
            boxShadow: '0 10px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-plus-jakarta)',
            fontSize: '0.78rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            animation: 'pillIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'translateX(-50%) scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'translateX(-50%) scale(1)')}
        >
          <img
            src="/icons/icon-192.png"
            alt=""
            style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }}
          />
          <span style={{ color: 'var(--color-primary)' }}>📲</span>
          Installer NavéStats
        </button>
      )}

      {show && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={handleDismiss}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 998,
              animation: 'fadeIn 0.3s ease',
            }}
          />

          {/* Banner */}
          <div style={{
            position: 'fixed',
            bottom: 'max(90px, calc(env(safe-area-inset-bottom) + 82px))',
            left: 12,
            right: 12,
            zIndex: 999,
            background: 'var(--gradient-hero)',
            borderRadius: 24,
            padding: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            maxWidth: 480,
            margin: '0 auto',
          }}>
            <button
              onClick={handleDismiss}
              aria-label="Fermer"
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem',
              }}
            >✕</button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <img
                src="/icons/icon-192.png"
                alt="NavéStats"
                style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, fontSize: '1rem', color: 'white', marginBottom: 4 }}>
                  Installer NavéStats 📲
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 16 }}>
                  {isIOS
                    ? <>Appuyez sur <strong style={{ color: '#fbbf24' }}>Partager</strong> puis <strong style={{ color: '#fbbf24' }}>« Sur l&apos;écran d&apos;accueil »</strong> pour accéder à NavéStats en un instant !</>
                    : deferredPrompt
                      ? <>Installez l&apos;app sur votre téléphone pour un accès rapide aux matchs, pronostics et classements des Navétanes !</>
                      : <>Ouvrez le menu du navigateur puis choisissez <strong style={{ color: '#fbbf24' }}>« Ajouter à l&apos;écran d&apos;accueil »</strong> ou <strong style={{ color: '#fbbf24' }}>« Installer l&apos;application »</strong>.</>}
                </div>

                {isIOS || !deferredPrompt ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px',
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>{isIOS ? '⬆️' : '📱'}</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                      {isIOS
                        ? <>Tap <strong style={{ color: '#fbbf24' }}>Share</strong> → <strong style={{ color: '#fbbf24' }}>Ajouter à l&apos;écran d&apos;accueil</strong></>
                        : <>Menu <strong style={{ color: '#fbbf24' }}>⋮</strong> → <strong style={{ color: '#fbbf24' }}>Installer l&apos;application</strong></>}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstall}
                    id="pwa-install-btn"
                    style={{
                      width: '100%', padding: '12px 20px',
                      background: 'linear-gradient(135deg, #fbbf24, #ffc94d)',
                      border: 'none', borderRadius: 12, cursor: 'pointer',
                      fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800,
                      fontSize: '0.9rem', color: '#451a03',
                      boxShadow: '0 4px 16px rgba(251,191,0,0.4)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    📲 Installer maintenant — Gratuit
                  </button>
                )}

                <button
                  onClick={handleDismiss}
                  style={{
                    display: 'block', margin: '12px auto 0',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-plus-jakarta)', textDecoration: 'underline',
                  }}
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pillIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (min-width: 768px) {
          #pwa-install-pill { display: none !important; }
        }
      `}</style>
    </>
  )
}
