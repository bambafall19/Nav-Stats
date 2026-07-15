import type { Metadata } from 'next'
import AgentChat from '@/components/admin/AgentChat'

export const metadata: Metadata = {
  title: 'Agent IA – Admin NavéStats',
}

export default function AdminAgentPage() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: 'var(--font-outfit)',
            fontWeight: 900,
            fontSize: '1.6rem',
            color: 'var(--color-text-primary)',
            marginBottom: 6,
          }}
        >
          🤖 Agent IA NavéStats
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: 720 }}>
          Ton assistant de travail pour le site : actualités, analyses de matchs,
          posts réseaux, idées d&apos;engagement. Utilise les données live des
          équipes, résultats et classements.
        </p>
      </div>
      <AgentChat />
    </div>
  )
}
