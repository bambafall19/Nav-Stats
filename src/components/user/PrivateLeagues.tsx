'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export function PrivateLeagues({ userId }: { userId: string }) {
  const [leagues, setLeagues] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [leagueName, setLeagueName] = useState('')
  const [leagueDescription, setLeagueDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchLeagues()
  }, [userId])

  const fetchLeagues = async () => {
    try {
      const { data } = await supabase
        .from('leagues')
        .select('*, members:league_members(*)')
        .or(`creator_id.eq.${userId},league_members.user_id.eq.${userId}`)

      setLeagues(data || [])
    } catch (error) {
      addToast('Erreur', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLeague = async () => {
    if (!leagueName) {
      addToast('Entrez un nom', 'error')
      return
    }

    try {
      const { data: league } = await supabase
        .from('leagues')
        .insert({
          name: leagueName,
          description: leagueDescription,
          creator_id: userId,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        })
        .select()
        .single()

      await supabase.from('league_members').insert({
        league_id: league.id,
        user_id: userId,
        role: 'admin',
      })

      addToast('Ligue créée', 'success')
      setLeagueName('')
      setLeagueDescription('')
      setShowCreateForm(false)
      fetchLeagues()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const handleJoinLeague = async (leagueCode: string) => {
    try {
      const { data: league } = await supabase
        .from('leagues')
        .select('id')
        .eq('code', leagueCode)
        .single()

      if (!league) {
        addToast('Code invalide', 'error')
        return
      }

      await supabase.from('league_members').insert({
        league_id: league.id,
        user_id: userId,
        role: 'member',
      })

      addToast('Ligue rejointe', 'success')
      fetchLeagues()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', margin: 0 }}>
          🏆 Ligues Privées
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '10px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {showCreateForm ? '✕ Annuler' : '+ Créer une ligue'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form
          onSubmit={e => {
            e.preventDefault()
            handleCreateLeague()
          }}
          style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(16px, 3vw, 20px)',
            marginBottom: 24,
            display: 'grid',
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="Nom de la ligue"
            value={leagueName}
            onChange={e => setLeagueName(e.target.value)}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <textarea
            placeholder="Description (optionnel)"
            value={leagueDescription}
            onChange={e => setLeagueDescription(e.target.value)}
            rows={3}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 16px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            ✓ Créer
          </button>
        </form>
      )}

      {/* Leagues List */}
      {leagues.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'clamp(16px, 3vw, 20px)',
        }}>
          {leagues.map(league => (
            <div
              key={league.id}
              style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(16px, 3vw, 20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px 0' }}>
                  {league.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {league.description}
                </p>
              </div>

              <div style={{
                background: 'rgba(0,98,51,0.05)',
                borderRadius: 'var(--radius-md)',
                padding: 8,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Code d'accès
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                  {league.code}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
              }}>
                <span>👥</span>
                <span>{league.members?.length || 0} membres</span>
              </div>

              <a
                href={`/ligues/${league.id}`}
                style={{
                  padding: '10px 14px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Voir la ligue
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏆</div>
          <div>Aucune ligue pour le moment</div>
        </div>
      )}
    </div>
  )
}
