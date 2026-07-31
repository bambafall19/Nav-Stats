'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
          old_values: Record<string, unknown>
          new_values: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: { username: string }
}

interface Props {
  initialLogs: AuditLog[]
}

const ACTION_COLORS: Record<string, string> = {
  INSERT: '#10b981',
  UPDATE: '#f59e0b',
  DELETE: '#ef4444',
  LOGIN: '#3b82f6',
  LOGOUT: '#64748b',
}

export default function AuditLogsClient({ initialLogs }: Props) {
  const [logs, setLogs] = useState(initialLogs)
  const [filter, setFilter] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setLogs(prev => [payload.new as AuditLog, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const filtered = logs.filter(log => {
    if (!filter) return true
    const q = filter.toLowerCase()
    return (
      log.action.toLowerCase().includes(q) ||
      log.resource_type.toLowerCase().includes(q) ||
      log.user?.username?.toLowerCase().includes(q) ||
      log.resource_id?.toLowerCase().includes(q)
    )
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  const getActionColor = (action: string) => {
    const upper = action.toUpperCase()
    return ACTION_COLORS[upper] || '#64748b'
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          📋 Logs d&apos;audit
        </h1>
        <input
          type="text"
          placeholder="Rechercher..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-card)',
            fontSize: '0.9rem',
            minWidth: 200
          }}
        />
      </div>

      <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-elevated)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Utilisateur</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Action</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>Ressource</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                    {formatDate(log.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {log.user?.username || log.user_id?.slice(0, 8) || 'Système'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: `${getActionColor(log.action)}20`,
                      color: getActionColor(log.action),
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{log.resource_type}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {log.resource_id?.slice(0, 8) || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {log.ip_address || '-'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Aucun log trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
