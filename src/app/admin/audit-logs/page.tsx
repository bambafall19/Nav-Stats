import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import AuditLogsClient from './AuditLogsClient'

export const metadata: Metadata = { title: 'Audit Logs - NavéStats' }

export default async function AuditLogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, user:profiles(username)')
    .order('created_at', { ascending: false })
    .limit(100)

  return <AuditLogsClient initialLogs={logs || []} />
}
