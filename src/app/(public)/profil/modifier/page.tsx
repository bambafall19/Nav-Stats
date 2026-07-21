import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import PerformanceClient from './PerformanceClient'

export const metadata: Metadata = {
  title: 'Mes performances – NavéStats',
  description: 'Analysez vos performances, séries et évolution sur NavéStats.',
}

export const dynamic = 'force-dynamic'

export default async function PerformancesPage() {
  return <PerformanceClient />
}
