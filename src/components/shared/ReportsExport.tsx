'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export function ReportsExport() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profiles } = await supabase.from('profiles').select('*').order('points', { ascending: false })
        const { data: matchs } = await supabase.from('matchs').select('*')
        const { data: equipes } = await supabase.from('equipes').select('*')

        setData({ profiles, matchs, equipes })
      } catch (error) {
        addToast('Erreur lors du chargement', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const exportToCSV = (filename: string, content: string) => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    addToast(`${filename} téléchargé`, 'success')
  }

  const handleExportClassement = async () => {
    setExporting(true)
    try {
      let csv = 'Rang,Utilisateur,Points,Pronostics,Taux de Réussite\n'
      data.profiles.forEach((p: any, idx: number) => {
        const successRate = p.total_pronostics > 0 ? Math.round((p.pronostics_corrects / p.total_pronostics) * 100) : 0
        csv += `${idx + 1},"${p.username}",${p.points},${p.total_pronostics},${successRate}%\n`
      })
      exportToCSV('classement.csv', csv)
    } catch (error) {
      addToast('Erreur lors de l\'export', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportMatchs = async () => {
    setExporting(true)
    try {
      let csv = 'Date,Heure,Équipe 1,Équipe 2,Score,Statut\n'
      data.matchs.forEach((m: any) => {
        csv += `${m.date},${m.heure},"${m.equipe1}","${m.equipe2}","${m.score1}-${m.score2}",${m.statut}\n`
      })
      exportToCSV('matchs.csv', csv)
    } catch (error) {
      addToast('Erreur lors de l\'export', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportEquipes = async () => {
    setExporting(true)
    try {
      let csv = 'Nom,ASC,Quartier,Points,Matchs Joués\n'
      data.equipes.forEach((e: any) => {
        csv += `"${e.nom}","${e.asc_nom || ''}","${e.quartier || ''}",${e.points_classement || 0},${e.matchs_joues || 0}\n`
      })
      exportToCSV('equipes.csv', csv)
    } catch (error) {
      addToast('Erreur lors de l\'export', 'error')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        📊 Rapports & Exports
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(16px, 3vw, 20px)' }}>
        {/* Classement Export */}
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ fontSize: '2rem' }}>🏆</div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px 0' }}>
              Classement Général
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Exporter le classement en CSV
            </p>
          </div>
          <button
            onClick={handleExportClassement}
            disabled={exporting}
            style={{
              padding: '10px 14px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? '⏳ Export...' : '📥 Télécharger'}
          </button>
        </div>

        {/* Matchs Export */}
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ fontSize: '2rem' }}>⚽</div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px 0' }}>
              Matchs
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Exporter tous les matchs en CSV
            </p>
          </div>
          <button
            onClick={handleExportMatchs}
            disabled={exporting}
            style={{
              padding: '10px 14px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? '⏳ Export...' : '📥 Télécharger'}
          </button>
        </div>

        {/* Équipes Export */}
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ fontSize: '2rem' }}>🏅</div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px 0' }}>
              Équipes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Exporter toutes les équipes en CSV
            </p>
          </div>
          <button
            onClick={handleExportEquipes}
            disabled={exporting}
            style={{
              padding: '10px 14px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? '⏳ Export...' : '📥 Télécharger'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginTop: 'clamp(24px, 5vw, 32px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          📈 Statistiques
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Utilisateurs</div>
            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
              {data?.profiles?.length || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Matchs</div>
            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
              {data?.matchs?.length || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Équipes</div>
            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
              {data?.equipes?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
