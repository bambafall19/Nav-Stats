export interface OfflinePronostic {
  id: string
  match_id: string
  resultat_predit: 'equipe_a' | 'nul' | 'equipe_b'
  score_a_predit: number | null
  score_b_predit: number | null
  premier_buteur_id: string | null
  homme_du_match_predit_id: string | null
  score_exact: boolean
  created_at: string
  synced: boolean
}

const QUEUE_KEY = 'navestats-offline-pronostics'

export function getOfflineQueue(): OfflinePronostic[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveOfflineQueue(queue: OfflinePronostic[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function addToOfflineQueue(pronostic: Omit<OfflinePronostic, 'id' | 'created_at' | 'synced'>) {
  const queue = getOfflineQueue()
  const item: OfflinePronostic = {
    ...pronostic,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    synced: false,
  }
  queue.push(item)
  saveOfflineQueue(queue)
  return item
}

export function removeFromOfflineQueue(id: string) {
  const queue = getOfflineQueue().filter(item => item.id !== id)
  saveOfflineQueue(queue)
}

export async function syncOfflineQueue(supabase: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const queue = getOfflineQueue()
  const pending = queue.filter(item => !item.synced)
  
  for (const item of pending) {
    try {
      const { error } = await supabase.from('pronostics').upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        match_id: item.match_id,
        resultat_predit: item.resultat_predit,
        score_a_predit: item.score_a_predit,
        score_b_predit: item.score_b_predit,
        premier_buteur_id: item.premier_buteur_id,
        homme_du_match_predit_id: item.homme_du_match_predit_id,
        score_exact: item.score_exact,
      }, { onConflict: 'user_id,match_id' })
      
      if (!error) {
        removeFromOfflineQueue(item.id)
      }
    } catch (e) {
      console.error('Failed to sync pronostic', e)
    }
  }
}

export function getPendingCount(): number {
  return getOfflineQueue().filter(item => !item.synced).length
}
