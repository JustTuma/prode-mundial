'use client'
import { useState } from 'react'
import Link from 'next/link'
import { personColor } from '@/lib/teams'

type Tab = 'general' | 'weekly' | 'stats'

interface Profile {
  id: string; username: string; avatar_url: string | null
  total_points: number; exact_scores: number; correct_results: number; predictions_made: number
}
interface WeeklyEntry { userId: string; username: string; avatar_url: string | null; points: number; exact: number }
type StatWinner = { username: string; avatar_url: string | null; val: number } | null
interface GroupStats { masExacto: StatWinner; masArriesgado: StatWinner; masErrado: StatWinner; masLocalista: StatWinner }

function Avatar({ name, url, size, border }: { name: string; url: string | null; size: number; border?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: personColor(name),
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Anton', fontSize: size * 0.4, overflow: 'hidden',
      border: border || 'none', flexShrink: 0,
    }}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name?.[0]?.toUpperCase()}
    </div>
  )
}

export default function RankingView({ ranking, weeklyRanking, userId, weekStart, groupStats }: {
  ranking: Profile[]; weeklyRanking: WeeklyEntry[]; userId?: string; weekStart?: string; groupStats?: GroupStats
}) {
  const [tab, setTab] = useState<Tab>('general')
  const isWeek = tab === 'weekly'

  // normalize both datasets to a shared shape
  const rows = isWeek
    ? weeklyRanking.map((r, i) => ({ id: r.userId, pos: i + 1, name: r.username, url: r.avatar_url, pts: r.points, sub: `${r.exact} exactos`, isYou: r.userId === userId }))
    : ranking.map((r, i) => ({ id: r.id, pos: i + 1, name: r.username, url: r.avatar_url, pts: r.total_points, sub: `${r.exact_scores} exactos · ${r.predictions_made} pron.`, isYou: r.id === userId }))

  const podium = [rows[1], rows[0], rows[2]] // 2-1-3
  const bars = ['58px', '82px', '44px']
  const grads = ['linear-gradient(180deg,#E2E8F2,#AEB8C9)', 'linear-gradient(180deg,#FFE08A,#F6B400)', 'linear-gradient(180deg,#F0C39A,#DD9A5E)']
  const borders = ['3px solid #C4CCDA', '3px solid #F6B400', '3px solid #DD9A5E']
  const avSizes = [46, 54, 44]

  const seg = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      flex: 1, border: 'none', borderRadius: '999px', padding: '10px', fontWeight: 800, fontSize: '13px',
      cursor: 'pointer', fontFamily: 'Archivo',
      background: tab === t ? 'var(--accent)' : 'transparent',
      color: tab === t ? 'var(--accent-ink)' : 'var(--muted)',
    }}>{label}</button>
  )

  return (
    <div className="risein">
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '6px 0 2px' }}>Ranking</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '10px' }}>
        {isWeek ? `Esta semana · desde el ${weekStart}` : `${ranking.length} jugadores`}
      </p>

      <div style={{ display: 'flex', gap: '6px', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: '999px', padding: '4px' }}>
        {seg('general', 'General')}
        {seg('weekly', 'Semanal')}
        {seg('stats', 'Stats')}
      </div>

      {/* STATS DEL GRUPO */}
      {tab === 'stats' && (
        <div style={{ marginTop: '18px' }}>
          {(() => {
            const cards = [
              { key: 'masExacto', emoji: '🎯', title: 'El más exacto', w: groupStats?.masExacto, fmt: (v: number) => `${v} exactos`, color: 'var(--accent2)' },
              { key: 'masArriesgado', emoji: '🎲', title: 'El más arriesgado', w: groupStats?.masArriesgado, fmt: (v: number) => `${v.toFixed(1)} goles/partido`, color: 'var(--neg)' },
              { key: 'masLocalista', emoji: '🏠', title: 'El más localista', w: groupStats?.masLocalista, fmt: (v: number) => `${Math.round(v * 100)}% gana el local`, color: 'var(--accent)' },
              { key: 'masErrado', emoji: '🙈', title: 'El más errado', w: groupStats?.masErrado, fmt: (v: number) => `${v} pifies`, color: 'var(--muted)' },
            ]
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, margin: '0 0 2px' }}>Los títulos del grupo según cómo pronostican 😄</p>
                {cards.map(c => (
                  <div key={c.key} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '30px' }}>{c.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{c.title}</div>
                      {c.w ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <Avatar name={c.w.username} url={c.w.avatar_url} size={28} />
                            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.w.username}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: c.color, fontWeight: 700, marginTop: '2px' }}>{c.fmt(c.w.val)}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Sin datos todavía</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {/* Podio */}
      {tab !== 'stats' && rows.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', margin: '18px 0 20px' }}>
          {podium.map((p, i) => p && (
            <Link key={p.id} href={`/profile/${p.name}`} style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {i === 1 && <span style={{ fontSize: '18px', color: '#F6B400', lineHeight: 1, marginBottom: '2px' }}>★</span>}
              <Avatar name={p.name} url={p.url} size={avSizes[i]} border={borders[i]} />
              <span style={{ fontSize: i === 1 ? '13px' : '12px', fontWeight: i === 1 ? 900 : 800, marginTop: '7px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{p.name}</span>
              <span className="font-display" style={{ fontSize: i === 1 ? '16px' : '15px', color: i === 1 ? 'var(--accent2)' : 'var(--muted)' }}>{p.pts}</span>
              <div className="font-display" style={{ width: '100%', height: bars[i], marginTop: '7px', borderRadius: '14px 14px 0 0', background: grads[i], display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: i === 1 ? '10px' : '8px', fontSize: i === 1 ? '26px' : '20px', color: '#fff' }}>{p.pos}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Lista */}
      {tab !== 'stats' && rows.length === 0 && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
          {isWeek ? 'Sin resultados esta semana' : 'Sé el primero en el ranking'}
        </div>
      )}
      {tab !== 'stats' && rows.map(row => (
        <Link key={row.id} href={`/profile/${row.name}`} style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
            borderRadius: '14px', marginBottom: '8px',
            background: row.isYou ? 'var(--surface2)' : 'var(--surface)',
            border: `1px solid ${row.isYou ? 'var(--accent)' : 'var(--line)'}`,
          }}>
            <span className="font-display" style={{ width: '20px', fontSize: '16px', color: 'var(--muted)', textAlign: 'center' }}>{row.pos}</span>
            <Avatar name={row.name} url={row.url} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: row.isYou ? 900 : 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}{row.isYou && ' (vos)'}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{row.sub}</div>
            </div>
            <span className="font-display" style={{ fontSize: '19px', color: 'var(--ink)', minWidth: '38px', textAlign: 'right' }}>{row.pts}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
