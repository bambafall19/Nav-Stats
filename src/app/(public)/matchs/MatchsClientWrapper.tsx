'use client'

import MatchListClient from '@/components/matchs/MatchListClient'

interface MatchsClientWrapperProps {
  initialMatchs: any[]
}

export default function MatchsClientWrapper({ initialMatchs }: MatchsClientWrapperProps) {
  return <MatchListClient initialMatchs={initialMatchs} />
}