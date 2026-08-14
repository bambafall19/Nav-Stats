import {
  LayoutDashboard, Shield, Users, Target, Calendar, Trophy,
  CheckCircle, UserCheck, Newspaper, Bell, Handshake, Flag, Baby,
} from 'lucide-react'

export const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/admin/equipes', icon: Shield, label: 'Équipes' },
  { href: '/admin/joueurs', icon: UserCheck, label: 'Joueurs' },
  { href: '/admin/matchs', icon: Target, label: 'Matchs' },
  { href: '/admin/cadets', icon: Calendar, label: 'Cadets' },
  { href: '/admin/classements', icon: Trophy, label: 'Classements' },
  { href: '/admin/resultats', icon: CheckCircle, label: 'Résultats' },
  { href: '/admin/resultats-cadets', icon: Baby, label: 'Résultats Cadets' },
  { href: '/admin/reports', icon: Flag, label: 'Reports' },
  { href: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/actualites', icon: Newspaper, label: 'Actualités' },
  { href: '/admin/partenaires', icon: Handshake, label: 'Partenaires' },
  { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
]
