'use client'
import { useState } from 'react'
import Link from 'next/link'
import { personColor } from '@/lib/teams'

type Tab = 'general' | 'weekly'

interface Profile {
  id: string; username: string; avatar_url: string | null
  total_points: number; exact_scores: number; correct_results: number; predictions_made: number
}
interface WeeklyEntry { userId: string; username: string; avatar_url: string | null; points: number; exact: number }

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

export default function RankingView({ ranking, weeklyRanking, userId, weekStart }: {
  ranking: Profile[]; weeklyRanking: WeeklyEntry[]; userId?: string; weekStart?: string
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
      </div>

      {/* Podio */}
      {rows.length >= 3 && (
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
      {rows.length === 0 && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
          {isWeek ? 'Sin resultados esta semana' : 'Sé el primero en el ranking'}
        </div>
      )}
      {rows.map(row => (
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
