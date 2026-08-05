'use client'

import { useState } from 'react'
import { Users, Shield, Home, Trophy } from 'lucide-react'

type TabType = 'pronostiqueurs' | 'equipes' | 'quartiers' | 'asc'

interface ClassementTabsProps {
  pronostiqueurs: React.ReactNode
  equipes: React.ReactNode
  quartiers: React.ReactNode
  asc: React.ReactNode
}

export function ClassementTabs({ pronostiqueurs, equipes, quartiers, asc }: ClassementTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pronostiqueurs')

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'pronostiqueurs', label: 'Pronostiqueurs', icon: <Users size={15} /> },
    { id: 'equipes', label: 'Équipes', icon: <Shield size={15} /> },
    { id: 'quartiers', label: 'Quartiers', icon: <Home size={15} /> },
    { id: 'asc', label: 'ASC', icon: <Trophy size={15} /> },
  ]

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        overflowX: 'auto',
        marginBottom: 16,
        paddingBottom: 6,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: active ? 'var(--color-primary-50)' : 'var(--color-surface-card)',
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: active ? 700 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-plus-jakarta)',
                transition: 'all 0.2s ease',
                minHeight: 40,
                boxShadow: active ? '0 0 16px rgba(42,255,160,0.14)' : 'var(--shadow-xs)',
              }}
            >
              <span style={{ display: 'inline-flex', color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div>
        {activeTab === 'pronostiqueurs' && pronostiqueurs}
        {activeTab === 'equipes' && equipes}
        {activeTab === 'quartiers' && quartiers}
        {activeTab === 'asc' && asc}
      </div>
    </div>
  )
}
