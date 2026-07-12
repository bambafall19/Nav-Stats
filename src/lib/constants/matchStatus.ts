/**
 * Match Status Constants
 * Centralized definitions for match statuses used throughout the app
 */

export const MATCH_STATUSES = {
  COMING: 'a_venir',
  LIVE: 'en_cours',
  FINISHED: 'termine',
} as const

export type MatchStatus = typeof MATCH_STATUSES[keyof typeof MATCH_STATUSES]

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  [MATCH_STATUSES.COMING]: 'À venir',
  [MATCH_STATUSES.LIVE]: 'En direct',
  [MATCH_STATUSES.FINISHED]: 'Terminé',
}

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  [MATCH_STATUSES.COMING]: '#6366f1',
  [MATCH_STATUSES.LIVE]: '#ef4444',
  [MATCH_STATUSES.FINISHED]: '#22c55e',
}
