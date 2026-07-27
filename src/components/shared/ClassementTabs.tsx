'use client'

import { useState } from 'react'

type TabType = 'pronostiqueurs' | 'equipes' | 'quartiers' | 'asc'

interface ClassementTabsProps {
  children: Record<TabType, React.ReactNode>
}

export function ClassementTabs({ children }: ClassementTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pronostiqueurs')

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'pronostiqueurs', label: 'Pronostiqueurs', icon: '👤' },
    { id: 'equipes', label: 'Équipes', icon: '⚽' },
    { id: 'quartiers', label: 'Quartiers', icon: '🏘️' },
    { id: 'asc', label: 'ASC', icon: '🛡️' },
  ]

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        marginBottom: 20,
        paddingBottom: 8,
        scrollBehavior: 'smooth',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeTab === tab.id ? 'white' : 'var(--color-text)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div>
        {children[activeTab]}
      </div>
    </div>
  )
}
