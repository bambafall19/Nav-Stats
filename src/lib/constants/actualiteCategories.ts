/**
 * Actualite Category Constants
 * Centralized definitions for actualite categories
 */

export const ACTUALITE_CATEGORIES = {
  ACTUALITE: 'actualite',
  ANNONCE: 'annonce',
  RESULTAT: 'resultat',
  CLASSEMENT: 'classement',
} as const

export type ActualiteCategory = typeof ACTUALITE_CATEGORIES[keyof typeof ACTUALITE_CATEGORIES]

export const ACTUALITE_CATEGORY_CONFIG: Record<
  ActualiteCategory,
  { label: string; bg: string; color: string }
> = {
  [ACTUALITE_CATEGORIES.ACTUALITE]: {
    label: '📰 Actualité',
    bg: 'rgba(59,130,246,0.1)',
    color: '#1d4ed8',
  },
  [ACTUALITE_CATEGORIES.ANNONCE]: {
    label: '📢 Annonce',
    bg: 'rgba(251,191,0,0.15)',
    color: '#7a5900',
  },
  [ACTUALITE_CATEGORIES.RESULTAT]: {
    label: '🏆 Résultat',
    bg: 'rgba(0,166,81,0.1)',
    color: '#006233',
  },
  [ACTUALITE_CATEGORIES.CLASSEMENT]: {
    label: '📊 Classement',
    bg: 'rgba(139,92,246,0.1)',
    color: '#6d28d9',
  },
}
