'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import {
  ArrowLeft, Bell, Trophy, BarChart3, Medal, Megaphone, CircleDot,
  Check, CheckCheck, Trash2, X, RefreshCw,
} from 'lucide-react'

type Notification = Database['public']['Tables']['notifications']['Row']

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  match: { icon: <CircleDot size={20} strokeWidth={2} />, color: '#22C55E' },
  resultat: { icon: <Trophy size={20} strokeWidth={2} />, color: '#FFC94D' },
  classement: { icon: <BarChart3 size={20} strokeWidth={2} />, color: '#4DA6FF' },
  badge: { icon: <Medal size={20} strokeWidth={2} />, color: '#A855F7' },
  annonce: { icon: <Megaphone size={20} strokeWidth={2} />, color: '#9CA3AF' },
}

const FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'unread', label: 'Non lues' },
  { id: 'matchs', label: 'Matchs' },
  { id: 'systeme', label: 'Système' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

function filterNotifications(list: Notification[], filter: FilterId) {
  switch (filter) {
    case 'unread': return list.filter(n => !n.est_lue)
    case 'matchs': return list.filter(n => n.type === 'match' || n.type === 'resultat')
    case 'systeme': return list.filter(n => n.type === 'annonce' || n.type === 'classement' || n.type === 'badge')
    default: return list
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days} j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function vibrate(ms: number) {
  try { navigator.vibrate?.(ms) } catch { /* ignore */ }
}

interface CardProps {
  notif: Notification
  selectionMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  onOpen: (n: Notification) => void
  onDelete: (id: string) => void
}

function NotificationCard({ notif, selectionMode, selected, onToggleSelect, onOpen, onDelete }: CardProps) {
  const controls = useAnimationControls()
  const meta = TYPE_META[notif.type] || { icon: <Bell size={20} strokeWidth={2} />, color: '#9CA3AF' }
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPress = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (selectionMode) return
    const { offset, velocity } = info
    if (offset.x < -120 || (offset.x < -50 && velocity.x < -500)) {
      controls.start({ x: -440, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } })
      setTimeout(() => onDelete(notif.id), 160)
      return
    }
    if (offset.x < -40) {
      controls.start({ x: -84 })
    } else {
      controls.start({ x: 0 })
    }
  }

  const confirmDelete = () => {
    controls.start({ x: -440, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } })
    setTimeout(() => onDelete(notif.id), 160)
  }

  const handleTap = () => {
    if (selectionMode) {
      onToggleSelect(notif.id)
      return
    }
    onOpen(notif)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}
    >
      {/* Zone de suppression rouge révélée au swipe */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, right: 0, width: 88,
        background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <button
          onClick={confirmDelete}
          style={{
            width: '100%', height: '100%', background: 'transparent', border: 'none',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            flexDirection: 'column', cursor: 'pointer', fontFamily: 'var(--font-inter)',
            fontWeight: 700, fontSize: 12,
          }}
        >
          <Trash2 size={22} />
          Supprimer
        </button>
      </div>

      {/* Carte déplaçable */}
      <motion.div
        drag={selectionMode ? false : 'x'}
        dragConstraints={{ left: -84, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={handleTap}
        onPointerDown={() => {
          clearPress()
          pressTimer.current = setTimeout(() => {
            vibrate(12)
            onToggleSelect(notif.id)
          }, 480)
        }}
        onPointerUp={clearPress}
        onPointerLeave={clearPress}
        onPointerMove={clearPress}
        style={{
          background: '#151A1E',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 20,
          padding: 16,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          cursor: 'pointer',
          touchAction: 'pan-y',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.28)',
        }}
      >
        {/* Checkbox mode sélection */}
        {selectionMode && (
          <div style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${selected ? '#22C55E' : '#2A2F36'}`,
            background: selected ? '#22C55E' : 'transparent',
            transition: 'all 0.15s ease',
          }}>
            {selected && <Check size={14} color="#04120A" strokeWidth={3.5} />}
          </div>
        )}

        {/* Icône */}
        <div style={{
          width: 42, height: 42, borderRadius: 14, flexShrink: 0,
          background: `${meta.color}1A`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: meta.color,
        }}>
          {meta.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 14.5, fontWeight: 700, color: '#FFFFFF',
              fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{notif.titre}</span>
            {!notif.est_lue && (
              <span style={{
                flexShrink: 0, fontSize: 10, fontWeight: 800,
                color: '#04120A', background: '#22C55E',
                padding: '2px 8px', borderRadius: 999,
              }}>Nouveau</span>
            )}
          </div>
          <p style={{
            margin: 0, fontSize: 13, lineHeight: 1.5, color: '#9CA3AF',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {notif.message}
          </p>
          <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 500, color: '#6B7280' }}>
            {timeAgo(notif.created_at)}
          </div>
        </div>

        {!notif.est_lue && (
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
            flexShrink: 0, marginTop: 6,
          }} />
        )}
      </motion.div>
    </motion.div>
  )
}

export default function NotificationsScreen() {
  const router = useRouter()
  const supabaseRef = useRef(createClient() as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterId>('all')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [pull, setPull] = useState(0)
  const pullStartY = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const instanceId = useRef(`notif-page-${useId().replace(/[^a-zA-Z0-9]/g, '')}`)

  const supabase = supabaseRef.current

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/auth/login')
      return
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setNotifications(data || [])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    let active = true
    const client = supabaseRef.current
    let channel: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
    ;(async () => {
      const { data: { user } } = await client.auth.getUser()
      if (!active) return
      fetchNotifications()
      if (!user) return
      channel = client
        .channel(instanceId.current)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => { fetchNotifications() })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => { fetchNotifications() })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => { fetchNotifications() })
        .subscribe()
    })()
    return () => {
      active = false
      if (channel) client.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unreadCount = notifications.filter(n => !n.est_lue).length
  const visible = filterNotifications(notifications, filter)

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    vibrate(8)
    await supabase.from('notifications').update({ est_lue: true }).eq('user_id', user.id).eq('est_lue', false)
    setNotifications(prev => prev.map(n => ({ ...n, est_lue: true })))
  }

  const markOneRead = async (n: Notification) => {
    if (n.est_lue) return
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, est_lue: true } : x))
    await supabase.from('notifications').update({ est_lue: true }).eq('id', n.id)
  }

  const handleDelete = async (id: string) => {
    vibrate(10)
    setNotifications(prev => prev.filter(n => n.id !== id))
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s })
    await supabase.from('notifications').delete().eq('id', id)
  }

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    vibrate(12)
    const ids = [...selectedIds]
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)))
    setSelectedIds(new Set())
    setSelectionMode(false)
    await supabase.from('notifications').delete().in('id', ids)
  }

  const handleOpen = (n: Notification) => {
    markOneRead(n)
    if (n.lien) router.push(n.lien)
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      if (s.size === 0) setSelectionMode(false)
      return s
    })
    setSelectionMode(true)
  }

  const exitSelection = () => {
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  const refresh = async () => {
    setRefreshing(true)
    vibrate(20)
    await fetchNotifications()
    setRefreshing(false)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current == null) return
    const delta = e.touches[0].clientY - pullStartY.current
    if (delta > 0) setPull(Math.min(delta * 0.45, 90))
  }

  const onTouchEnd = () => {
    pullStartY.current = null
    if (pull > 55) {
      setRefreshing(true)
      refresh()
    }
    setPull(0)
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 260, mass: 0.9 }}
      style={{
        minHeight: '100dvh',
        background: '#0B0F10',
        color: '#FFFFFF',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(11, 15, 16, 0.82)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: `calc(10px + env(safe-area-inset-top)) 20px 12px`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button
            onClick={() => router.back()}
            aria-label="Retour"
            style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{
              margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
              fontFamily: 'var(--font-display), sans-serif',
            }}>Notifications</h1>
            {unreadCount > 0 && (
              <span style={{
                minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999,
                background: '#22C55E', color: '#04120A',
                fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unreadCount}</span>
            )}
          </div>

          {unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              style={{
                flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                color: '#22C55E', fontSize: 12.5, fontWeight: 700,
                fontFamily: 'var(--font-inter)', display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 0',
              }}
            >
              <CheckCheck size={16} /> Tout marquer lu
            </button>
          ) : (
            <div style={{ width: 40, flexShrink: 0 }} />
          )}
        </div>
      </header>

      {/* Filtres */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 19,
        background: '#0B0F10',
        padding: '12px 20px 4px',
        display: 'flex', gap: 8, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {FILTERS.map(f => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); exitSelection() }}
              style={{
                flexShrink: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 999,
                border: active ? 'none' : '1px solid #2A2F36',
                background: active ? '#22C55E' : 'transparent',
                color: active ? '#04120A' : '#9CA3AF',
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-inter)',
                transition: 'all 0.2s ease',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Liste */}
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          flex: 1, overflowY: 'auto', padding: '12px 20px 40px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Indicateur pull-to-refresh */}
        <motion.div
          animate={{ height: pull > 12 || refreshing ? 46 : 0, opacity: pull > 12 || refreshing ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}
        >
          <RefreshCw size={20} color="#22C55E" style={{
            animation: refreshing ? 'notif-spin 0.8s linear infinite' : 'none',
          }} />
        </motion.div>

        <motion.div
          animate={{ y: pull }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560, margin: '0 auto' }}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                height: 108, borderRadius: 20, background: '#151A1E',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: 'notif-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.12}s`,
              }} />
            ))
          ) : visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
              }}
            >
              <div style={{
                width: 84, height: 84, borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Bell size={36} color="#22C55E" strokeWidth={1.8} />
              </div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
                {filter === 'all' && 'Aucune notification'}
                {filter === 'unread' && 'Aucune notification non lue'}
                {filter === 'matchs' && 'Aucune notification de match'}
                {filter === 'systeme' && 'Aucune notification système'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#9CA3AF' }}>
                {filter === 'all' && 'Vous êtes à jour.'}
                {filter === 'unread' && 'Tout est lu.'}
                {filter === 'matchs' && 'Les matchs et résultats apparaîtront ici.'}
                {filter === 'systeme' && 'Les annonces et classements apparaîtront ici.'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {visible.map(notif => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  selectionMode={selectionMode}
                  selected={selectedIds.has(notif.id)}
                  onToggleSelect={handleToggleSelect}
                  onOpen={handleOpen}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      {/* Barre de sélection */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
              background: 'rgba(17, 20, 21, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.07)',
              padding: `12px 20px calc(12px + env(safe-area-inset-bottom))`,
            }}
          >
            <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#FFFFFF',
                minWidth: 64,
              }}>
                {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
              </span>

              <button
                onClick={deleteSelected}
                disabled={selectedIds.size === 0}
                style={{
                  flex: 1, height: 48, borderRadius: 16, cursor: 'pointer',
                  background: '#EF4444', color: '#FFFFFF', border: 'none',
                  fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-inter)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: selectedIds.size === 0 ? 0.4 : 1,
                }}
              >
                <Trash2 size={18} /> Supprimer
              </button>

              <button
                onClick={markAllRead}
                style={{
                  height: 48, padding: '0 16px', borderRadius: 16, cursor: 'pointer',
                  background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)',
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-inter)',
                  display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}
              >
                <CheckCheck size={16} /> Tout marquer lu
              </button>

              <button
                onClick={exitSelection}
                aria-label="Annuler"
                style={{
                  width: 48, height: 48, borderRadius: 16, cursor: 'pointer', flexShrink: 0,
                  background: 'rgba(255, 255, 255, 0.06)', color: '#9CA3AF', border: '1px solid #2A2F36',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes notif-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes notif-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </motion.div>
  )
}
