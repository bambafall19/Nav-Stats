'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export function TwoFactorAuth({ userId }: { userId: string }) {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient() as any
  const { addToast } = useToast()

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    return codes
  }

  const handleEnable2FA = async () => {
    setLoading(true)
    try {
      const codes = generateBackupCodes()
      setBackupCodes(codes)
      setShowBackupCodes(true)

      await supabase
        .from('profiles')
        .update({
          two_fa_enabled: true,
          backup_codes: codes,
        })
        .eq('id', userId)

      addToast('2FA activé', 'success')
      setTwoFAEnabled(true)
    } catch (error) {
      addToast('Erreur', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setLoading(true)
    try {
      await supabase
        .from('profiles')
        .update({ two_fa_enabled: false })
        .eq('id', userId)

      addToast('2FA désactivé', 'success')
      setTwoFAEnabled(false)
    } catch (error) {
      addToast('Erreur', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'clamp(16px, 3vw, 20px)',
    }}>
      <h3 style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
        🔐 Authentification à Deux Facteurs
      </h3>

      <div style={{
        background: 'rgba(42,255,160,0.05)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Statut: {twoFAEnabled ? '✓ Activé' : '✕ Désactivé'}
          </div>
          <div style={{
            background: twoFAEnabled ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            {twoFAEnabled ? 'Sécurisé' : 'Non sécurisé'}
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          La 2FA ajoute une couche de sécurité supplémentaire à votre compte
        </div>
      </div>

      {!twoFAEnabled ? (
        <button
          onClick={handleEnable2FA}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '⏳ Activation...' : '🔒 Activer 2FA'}
        </button>
      ) : (
        <>
          {showBackupCodes && (
            <div style={{
              background: 'rgba(255,201,77,0.14)',
              border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              marginBottom: 16,
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, color: 'var(--color-accent)' }}>
                ⚠️ Codes de secours
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                Sauvegardez ces codes dans un endroit sûr. Vous pouvez les utiliser pour accéder à votre compte si vous perdez votre téléphone.
              </div>
              <div style={{
                background: 'var(--color-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                lineHeight: 1.8,
                marginBottom: 12,
              }}>
                {backupCodes.map((code, idx) => (
                  <div key={idx}>{code}</div>
                ))}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'))
                  addToast('Codes copiés', 'success')
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--color-accent)',
                  color: '#0a0f0d',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                📋 Copier les codes
              </button>
            </div>
          )}

          <button
            onClick={handleDisable2FA}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--color-red)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '⏳ Désactivation...' : '🔓 Désactiver 2FA'}
          </button>
        </>
      )}
    </div>
  )
}
