// Définitions des achievements
export const ACHIEVEMENTS = {
  TOP_10: {
    id: 'top10',
    name: 'Top 10',
    icon: '🏆',
    description: 'Être dans le top 10 du classement',
    condition: (rank: number) => rank <= 10,
  },
  TOP_3: {
    id: 'top3',
    name: 'Top 3',
    icon: '👑',
    description: 'Être dans le top 3 du classement',
    condition: (rank: number) => rank <= 3,
  },
  PERFECT_WEEK: {
    id: 'perfect_week',
    name: 'Semaine Parfaite',
    icon: '⭐',
    description: 'Avoir 100% de réussite pendant une semaine',
    condition: (accuracy: number) => accuracy === 100,
  },
  STREAK_10: {
    id: 'streak_10',
    name: 'Série de 10',
    icon: '🔥',
    description: 'Avoir une série de 10 pronostics corrects',
    condition: (streak: number) => streak >= 10,
  },
  BEST_PERCENTAGE: {
    id: 'best_percentage',
    name: 'Meilleur %',
    icon: '📈',
    description: 'Avoir le meilleur pourcentage de réussite',
    condition: () => true, // À vérifier contre les autres utilisateurs
  },
  RISING_STAR: {
    id: 'rising_star',
    name: 'Étoile Montante',
    icon: '⬆️',
    description: 'Monter de 10 places en une semaine',
    condition: (rankChange: number) => rankChange >= 10,
  },
  FIRST_PREDICTION: {
    id: 'first_prediction',
    name: 'Premier Pas',
    icon: '🎯',
    description: 'Faire son premier pronostic',
    condition: () => true,
  },
  HUNDRED_PREDICTIONS: {
    id: 'hundred_predictions',
    name: 'Centième',
    icon: '💯',
    description: 'Faire 100 pronostics',
    condition: (total: number) => total >= 100,
  },
  THOUSAND_PREDICTIONS: {
    id: 'thousand_predictions',
    name: 'Millième',
    icon: '🎊',
    description: 'Faire 1000 pronostics',
    condition: (total: number) => total >= 1000,
  },
} as const

// Périodes de classement
export const RANKING_PERIODS = {
  WEEK: 'semaine',
  MONTH: 'mois',
  SEASON: 'saison',
} as const

// Limites de pagination
export const PAGINATION = {
  CLASSEMENT_PER_PAGE: 12,
  SEARCH_RESULTS: 10,
  TRENDING_ITEMS: 10,
  FOLLOWERS_PER_PAGE: 20,
} as const

// Durées de cache (en millisecondes)
export const CACHE_DURATIONS = {
  CLASSEMENT: 5 * 60 * 1000, // 5 minutes
  EQUIPES: 10 * 60 * 1000, // 10 minutes
  PROFILE: 3 * 60 * 1000, // 3 minutes
  STATISTICS: 15 * 60 * 1000, // 15 minutes
  SEARCH: 1 * 60 * 1000, // 1 minute
} as const

// Types de notifications
export const NOTIFICATION_TYPES = {
  RANK_UP: 'up',
  RANK_DOWN: 'down',
  NEW_FOLLOWER: 'new_follower',
  ACHIEVEMENT_EARNED: 'achievement_earned',
} as const

// Couleurs pour les graphiques
export const CHART_COLORS = {
  PRIMARY: '#006233',
  SUCCESS: '#00A651',
  WARNING: '#FFB81C',
  DANGER: '#E74C3C',
  NEUTRAL: '#95A5A6',
} as const

// Emojis pour les badges
export const BADGE_EMOJIS = {
  TROPHY: '🏆',
  CROWN: '👑',
  STAR: '⭐',
  FIRE: '🔥',
  CHART: '📈',
  ARROW_UP: '⬆️',
  TARGET: '🎯',
  HUNDRED: '💯',
  PARTY: '🎊',
  TRENDING: '📊',
  USERS: '👥',
  TEAM: '⚽',
  QUARTER: '🏘️',
  SHIELD: '🛡️',
} as const

// Messages de notification
export const NOTIFICATION_MESSAGES = {
  RANK_UP: (name: string, oldRank: number, newRank: number) =>
    `${name} est passé de #${oldRank} à #${newRank} 📈`,
  RANK_DOWN: (name: string, oldRank: number, newRank: number) =>
    `${name} est passé de #${oldRank} à #${newRank} 📉`,
  ACHIEVEMENT_EARNED: (name: string, achievement: string) =>
    `${name} a débloqué ${achievement}! 🎉`,
  NEW_FOLLOWER: (followerName: string) =>
    `${followerName} vous suit maintenant! 👋`,
} as const
