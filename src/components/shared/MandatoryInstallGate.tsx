'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const LS_INSTALLED = 'navestats-pwa-installed'
const LS_LAST_LATER = 'navestats-gate-last-later'
const REOPEN_MS = 60 * 1000

export default function MandatoryInstallGate() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [ready, setReady] = useState(false)
  const [noShow, setNoShow] = useState(false)
  const reopenedRef = useRef<number | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      localStorage.getItem(LS_INSTALLED)
    ) {
      setInstalled(true)
      return
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const android = /android/i.test(navigator.userAgent)
    if (!ios && !android) {
      // Sur ordinateur : on n'affiche la porte que si l'installation est dispo
      // (beforeinstallprompt Chrome/Edge). Sinon on ne bloque pas.
      setNoShow(true)
      return
    }

    setIsIOS(ios)
    setIsAndroid(android)
    setReady(true)

    const onAppInstalled = () => {
      setInstalled(true)
      setVisible(false)
      localStorage.setItem(LS_INSTALLED, '1')
    }
    window.addEventListener('appinstalled', onAppInstalled)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    if (!ios) {
      window.addEventListener('beforeinstallprompt', handler)
    }

    return () => {
      window.removeEventListener('appinstalled', onAppInstalled)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const isAuthPage = pathname.startsWith('/auth')

  const showGate = useCallback(() => {
    if (isAuthPage) return
    setVisible(true)
    document.body.style.overflow = 'hidden'
  }, [isAuthPage])

  useEffect(() => {
    if (!ready || installed || noShow || isAuthPage) return

    const t = setTimeout(showGate, 1200)
    return () => clearTimeout(t)
  }, [ready, installed, noShow, isAuthPage, showGate, pathname])

  useEffect(() => {
    if (!visible) return
    // Même après « Plus tard », la porte revient au bout de 60 s : aucune
    // fermeture définitive tant que l'app n'est pas installée.
    reopenedRef.current = window.setInterval(() => {
      if (document.hidden) return
      setVisible(true)
    }, REOPEN_MS)
    return () => {
      if (reopenedRef.current) window.clearInterval(reopenedRef.current)
    }
  }, [visible])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      localStorage.setItem(LS_INSTALLED, '1')
    }
    setVisible(false)
  }

  const handleLater = () => {
    setVisible(false)
    localStorage.setItem(LS_LAST_LATER, String(Date.now()))
  }

  if (installed || noShow || !visible) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          background: 'rgba(2,6,4,0.92)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          animation: 'gateFadeIn 0.35s ease',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            background: 'var(--gradient-hero)',
            borderRadius: 28,
            padding: 28,
            textAlign: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)',
            animation: 'gatePop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              margin: '0 auto 16px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <img src="/icons/icon-192.png" alt="NavéStats" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: '#fff' }}>
            Installe NavéStats 📲
          </div>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, margin: '10px 0 18px' }}>
            L’app est obligatoire pour suivre les matchs, pronostiquer et gagner des points sur ton téléphone.
          </p>

          {isIOS ? (
            <div style={{ display: 'grid', gap: 10, textAlign: 'left' }}>
              <InstructionRow step={1} text={<>Appuie sur <strong>Partager</strong> <span style={{ fontSize: '1.1rem' }}>⬆️</span> en bas de l’écran</>} />
              <InstructionRow step={2} text={<>Choisis <strong>« Sur l’écran d’accueil »</strong> <span style={{ fontSize: '1.1rem' }}>🏠</span></>} />
              <InstructionRow step={3} text={<>Puis <strong>Ajouter</strong> et ouvre NavéStats depuis ton accueil</>} />
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #fbbf24, #ffc94d)',
                border: 'none',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: '#451a03',
                boxShadow: '0 6px 20px rgba(251,191,0,0.45)',
              }}
            >
              📲 Installer maintenant — Gratuit
            </button>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px' }}>
              Ouvre le menu <strong>⋮</strong> du navigateur puis choisis <strong>« Installer l’application »</strong> ou <strong>« Ajouter à l’écran d’accueil »</strong>.
            </div>
          )}

          <button
            onClick={handleLater}
            style={{
              display: 'block',
              margin: '14px auto 0',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              textDecoration: 'underline',
            }}
          >
            Ce n’est pas le moment
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gateFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gatePop {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}

function InstructionRow({ step, text }: { step: number; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {step}
      </span>
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>{text}</span>
    </div>
  )
}
