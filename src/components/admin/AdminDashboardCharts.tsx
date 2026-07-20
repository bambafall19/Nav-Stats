'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, Area, AreaChart,
} from 'recharts'

interface AdminDashboardChartsProps {
  pronoChartData: { name: string; value: number; color: string }[]
  equipesChartData: { name: string; points: number; victoires: number }[]
  activityData: { day: string; pronostics: number }[]
  pronoDom: number
  pronoNul: number
  pronoExt: number
  pctDom: number
  pctNul: number
  pctExt: number
  realPronoTotal: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topUsers: any[]
  maxPoints: number
}

export function AdminDashboardCharts({
  pronoChartData,
  equipesChartData,
  activityData,
  pronoDom,
  pronoNul,
  pronoExt,
  pctDom,
  pctNul,
  pctExt,
  realPronoTotal,
  topUsers,
  maxPoints,
}: AdminDashboardChartsProps) {
  return (
    <section className="admin-charts-grid">
      {/* Graphique 1 : Distribution des pronostics */}
      <div className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <h2>📊 Distribution des pronostics</h2>
            <p>Tendances de la communauté sur tous les matchs.</p>
          </div>
          <span className="admin-pill">{realPronoTotal} votes</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pronoChartData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pronoChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value || 0} votes`, '']}
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { label: 'Victoire A', value: pronoDom, pct: pctDom, color: '#006233' },
              { label: 'Match Nul', value: pronoNul, pct: pctNul, color: '#64748B' },
              { label: 'Victoire B', value: pronoExt, pct: pctExt, color: '#1D4ED8' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: item.color }}>● {item.label}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.value} · {item.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: '#EEF2F7', overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 999, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique 2 : Activité sur 7 jours */}
      <div className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <h2>📈 Activité sur 7 jours</h2>
            <p>Évolution des pronostics sur la semaine.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProno" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006233" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#006233" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="pronostics"
              stroke="#006233"
              strokeWidth={2.5}
              fill="url(#colorProno)"
              dot={{ fill: '#006233', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Section 3 : Répartition par poule + Matchs par journée */}
      <div className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <h2>🏆 Répartition par Poule</h2>
            <p>Équipes réparties par groupe.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pronoChartData.filter(d => d.value > 0)}
              cx="50%"
              cy="50%"
              outerRadius={75}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {pronoChartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique 4 : Matchs par journée */}
      <div className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <h2>⚽ Matchs par Journée</h2>
            <p>Volume de matchs programmés.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={activityData.map(d => ({ jour: d.day, matchs: Math.max(d.pronostics, 1) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="matchs" fill="#006233" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top pronostiqueurs - pleine largeur */}
      <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="admin-section-heading">
          <div>
            <h2>👑 Top pronostiqueurs</h2>
            <p>Les profils les plus performants.</p>
          </div>
        </div>
        <div className="admin-leaderboard">
          {topUsers.length === 0 ? (
            <div className="admin-empty">Aucun utilisateur pour le moment</div>
          ) : topUsers.map((user, index) => {
            const pct = Math.round(((user.points || 0) / maxPoints) * 100)
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={`${user.username}-${index}`} className="admin-leader-row">
                <div className="admin-rank" style={{
                  background: index < 3 ? 'linear-gradient(135deg, #006233, #00A651)' : undefined,
                  color: index < 3 ? 'white' : undefined,
                }}>
                  {index < 3 ? medals[index] : index + 1}
                </div>
                <div className="admin-leader-content">
                  <div>
                    <strong>{user.username}</strong>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{(user.points || 0).toLocaleString('fr-FR')} pts</span>
                  </div>
                  <div className="admin-meter"><i style={{ width: `${pct}%` }} /></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top équipes */}
      <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="admin-section-heading">
          <div>
            <h2>🏆 Meilleures équipes</h2>
            <p>Points et victoires des tops ASC.</p>
          </div>
          <a href="/admin/classement" className="admin-link">Modifier →</a>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={equipesChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar dataKey="points" name="Points" fill="#006233" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="victoires" name="Victoires" fill="#00A651" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top pronostiqueurs */}
      <div className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <h2>👑 Top pronostiqueurs</h2>
            <p>Les profils les plus performants.</p>
          </div>
        </div>
        <div className="admin-leaderboard">
          {topUsers.length === 0 ? (
            <div className="admin-empty">Aucun utilisateur pour le moment</div>
          ) : topUsers.map((user, index) => {
            const pct = Math.round(((user.points || 0) / maxPoints) * 100)
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={`${user.username}-${index}`} className="admin-leader-row">
                <div className="admin-rank" style={{
                  background: index < 3 ? 'linear-gradient(135deg, #006233, #00A651)' : undefined,
                  color: index < 3 ? 'white' : undefined,
                }}>
                  {index < 3 ? medals[index] : index + 1}
                </div>
                <div className="admin-leader-content">
                  <div>
                    <strong>{user.username}</strong>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{(user.points || 0).toLocaleString('fr-FR')} pts</span>
                  </div>
                  <div className="admin-meter"><i style={{ width: `${pct}%` }} /></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .admin-charts-grid { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
        .admin-pill { border-radius: 999px; font-size: 0.74rem; font-weight: 800; padding: 6px 11px; color: var(--color-primary); background: rgba(0,98,51,0.08); white-space: nowrap; }
        @media (max-width: 900px) { .admin-charts-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  )
}
