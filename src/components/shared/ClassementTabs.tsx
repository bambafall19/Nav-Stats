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
                padding: '9px 18px',
                borderRadius: 'var(--radius-full)',
                border: active ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
                background: active ? 'var(--gradient-green)' : 'rgba(255, 255, 255, 0.04)',
                color: active ? '#04120A' : 'var(--color-text-secondary)',
                fontWeight: active ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-plus-jakarta)',
                transition: 'all 0.2s ease',
                minHeight: 42,
                boxShadow: active ? '0 6px 20px rgba(42,255,160,0.28)' : '0 1px 3px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              <span style={{ display: 'inline-flex', color: active ? '#04120A' : 'var(--color-text-muted)' }}>
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
