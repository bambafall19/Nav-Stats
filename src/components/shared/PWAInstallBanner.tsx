'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already dismissed or installed previously
    if (localStorage.getItem('navestats-pwa-dismissed')) return

    // Check if already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent)

    if (ios) {
      setIsIOS(true)
      // Show iOS instructions after a 3-second delay
      if (isMobile) setTimeout(() => setShow(true), 3000)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (isMobile) setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setShow(false)
    localStorage.setItem('navestats-pwa-dismissed', '1')
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('navestats-pwa-dismissed', '1')
  }

  if (!show || installed) return null

  return (
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
        bottom: 90, // above the mobile nav bar
        left: 12,
        right: 12,
        zIndex: 999,
        background: 'linear-gradient(135deg, #004d27 0%, #006233 60%, #00A651 100%)',
        borderRadius: 24,
        padding: '20px 20px 20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {/* Close button */}
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
          {/* Icon */}
          <img
            src="/icons/icon-192.png"
            alt="NavéStats"
            style={{
              width: 56, height: 56, borderRadius: 14,
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          />

          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-outfit)', fontWeight: 900,
              fontSize: '1rem', color: 'white', marginBottom: 4,
            }}>
              Installer NavéStats 📲
            </div>
            <div style={{
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.5, marginBottom: 16,
            }}>
              {isIOS
                ? <>Appuyez sur <strong style={{ color: '#FBBF00' }}>Partager</strong> puis <strong style={{ color: '#FBBF00' }}>"Sur l'écran d'accueil"</strong> pour accéder à NavéStats en un instant !</>
                : <>Installez l'app sur votre téléphone pour un accès rapide aux matchs, pronostics et classements des Navétanes !
                </>
              }
            </div>

            {isIOS ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px',
              }}>
                <span style={{ fontSize: '1.3rem' }}>⬆️</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  Tap <strong style={{ color: '#FBBF00' }}>Share</strong> → <strong style={{ color: '#FBBF00' }}>Ajouter à l'écran d'accueil</strong>
                </span>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                id="pwa-install-btn"
                style={{
                  width: '100%', padding: '12px 20px',
                  background: 'linear-gradient(135deg, #FBBF00, #D97706)',
                  border: 'none', borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'var(--font-outfit)', fontWeight: 800,
                  fontSize: '0.9rem', color: '#5a3800',
                  boxShadow: '0 4px 16px rgba(251,191,0,0.4)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                📲 Installer maintenant — Gratuit
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
