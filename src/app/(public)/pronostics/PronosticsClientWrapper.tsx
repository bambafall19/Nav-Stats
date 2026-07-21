
'use client'

import PronosticsClient from '@/components/pronostics/PronosticsClient'
import MonEspace from '@/components/home/MonEspace'

interface PronosticsClientWrapperProps {
  pronostics: any[]
  totalPoints: number
  corrects: number
  scoresExact: number
  pending: number
  accuracy: number
  profile?: any
  recentPronostics?: any[]
  pronosticsToMake?: number
}

export default function PronosticsClientWrapper(props: PronosticsClientWrapperProps) {
  const { profile, recentPronostics, pronosticsToMake } = props
  return (
    <>
      {profile && (
        <MonEspace
          profile={profile}
          recentPronostics={recentPronostics || []}
          pronosticsToMake={pronosticsToMake || 0}
        />
      )}
      <PronosticsClient {...props} />
    </>
  )
}
