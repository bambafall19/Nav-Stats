'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export default function GlobalNotifications() {
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'success'>('info')
  const [sending, setSending] = useState(false)
  const supabase = createClient() as any
  const { addToast } = useToast()

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) {
      addToast('Remplissez tous les champs', 'error')
      return
    }

    setSending(true)
    try {
      const { data: users } = await supabase.from('profiles').select('id')

      for (const user of users || []) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title,
          message,
          type,
          read: false,
        })
      }

      addToast(`Notification envoyée à ${users?.length || 0} utilisateurs`, 'success')
      setTitle('')
      setMessage('')
      setType('info')
    } catch (error) {
      addToast('Erreur lors de l\'envoi', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        📢 Notifications Globales
      </h1>

      <form onSubmit={handleSend} style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Maintenance prévue"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Votre message..."
            required
            rows={5}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
            Type
          </label>
          <select
            value={type}
            onChange={e => setType(e.target.value as any)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="info">ℹ️ Information</option>
            <option value="warning">⚠️ Avertissement</option>
            <option value="success">✓ Succès</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={sending}
          style={{
            padding: '12px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: sending ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? '📤 Envoi...' : '📤 Envoyer à tous'}
        </button>
      </form>

      <div style={{
        background: 'rgba(0,98,51,0.05)',
        border: '1px solid rgba(0,98,51,0.1)',
        borderRadius: 'var(--radius-md)',
        padding: 'clamp(12px, 2vw, 16px)',
        marginTop: 'clamp(16px, 3vw, 20px)',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
      }}>
        <strong>ℹ️ Info:</strong> Cette notification sera envoyée à tous les utilisateurs inscrits.
      </div>
    </div>
  )
}
