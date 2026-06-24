'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Match } from '@/lib/types'
import { teamColor, teamCode } from '@/lib/teams'

type Tab = 'grupos' | 'bracket'

function Dot({ code }: { code: string | null }) {
  return <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: teamColor(code), flexShrink: 0, display: 'inline-block' }} />
}

function GroupTable({ matches }: { matches: Match[] }) {
  const teams: Record<string, { code: string; pj: number; dg: number; pts: number }> = {}
  matches.forEach(m => {
    [[m.home_team, m.home_team_code], [m.away_team, m.away_team_code]].forEach(([name, code]) => {
      const k = name as string
      if (k && k !== 'Por definir' && !teams[k]) teams[k] = { code: teamCode(name as string, code as string), pj: 0, dg: 0, pts: 0 }
    })
    if (m.status !== 'FINISHED' || m.home_score == null || m.away_score == null) return
    const H = teams[m.home_team], A = teams[m.away_team]
    if (!H || !A) return
    H.pj++; A.pj++; H.dg += m.home_score - m.away_score; A.dg += m.away_score - m.home_score
    if (m.home_score > m.away_score) H.pts += 3
    else if (m.home_score < m.away_score) A.pts += 3
    else { H.pts++; A.pts++ }
  })
  const sorted = Object.entries(teams).map(([n, t]) => ({ n, ...t })).sort((a, b) => b.pts - a.pts || b.dg - a.dg)
  return (
    <>
      {sorted.map((r, i) => (
        <div key={r.n} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 8px', borderRadius: '10px', background: i < 2 ? 'var(--surface2)' : 'transparent', borderLeft: `3px solid ${i < 2 ? 'var(--accent)' : 'transparent'}`, marginBottom: '4px' }}>
          <span className="font-display" style={{ width: '14px', fontSize: '13px', color: 'var(--muted)' }}>{i + 1}</span>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: teamColor(r.code), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: '10px', flexShrink: 0 }}>{r.code}</div>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.n}</span>
          <span style={{ width: '22px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{r.pj}</span>
          <span style={{ width: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{r.dg > 0 ? '+' : ''}{r.dg}</span>
          <span className="font-display" style={{ width: '24px', textAlign: 'center', fontSize: '15px', color: 'var(--ink)' }}>{r.pts}</span>
        </div>
      ))}
    </>
  )
}

function BracketMatch({ m }: { m: Match }) {
  const isFinished = m.status === 'FINISHED'
  const homeWon = isFinished && m.home_score! > m.away_score!
  const awayWon = isFinished && m.away_score! > m.home_score!
  const tbd = !m.home_team || m.home_team === 'Por definir'
  const row = (name: string, code: string | null, score: number | null, won: boolean, real: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 0', opacity: real ? 1 : 0.45 }}>
      <Dot code={real ? code : null} />
      <span style={{ flex: 1, fontSize: '12px', fontWeight: won ? 900 : 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{real ? teamCode(name, code) : '?'}</span>
      <span className="font-display" style={{ fontSize: '14px', color: 'var(--ink)' }}>{score != null ? score : ''}</span>
    </div>
  )
  return (
    <Link href={`/matches/${m.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '8px 9px', borderRadius: '12px', width: '120px' }}>
        {row(m.home_team, m.home_team_code, m.home_score, homeWon, !tbd)}
        {row(m.away_team, m.away_team_code, m.away_score, awayWon, !tbd)}
      </div>
    </Link>
  )
}

export default function FixtureView({ matches }: { matches: Match[] }) {
  const params = useSearchParams()
  const [tab, setTab] = useState<Tab>('grupos')
  useEffect(() => { if (params.get('tab') === 'bracket') setTab('bracket') }, [params])

  const groups = ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'GROUP_E', 'GROUP_F', 'GROUP_G', 'GROUP_H', 'GROUP_I', 'GROUP_J', 'GROUP_K', 'GROUP_L']
  const byGroup = groups.reduce((acc, g) => {
    const gm = matches.filter(m => m.group_name === g)
    if (gm.length) acc[g] = gm
    return acc
  }, {} as Record<string, Match[]>)

  const stageMatches = (s: string) => matches.filter(m => m.stage === s)
  const r16 = [...stageMatches('LAST_16'), ...stageMatches('ROUND_OF_16')]
  const qf = stageMatches('QUARTER_FINALS')
  const sf = stageMatches('SEMI_FINALS')
  const fin = stageMatches('FINAL')
  const half = (a: Match[]) => ({ l: a.slice(0, Math.ceil(a.length / 2)), r: a.slice(Math.ceil(a.length / 2)) })
  const rounds = [
    r16.length && { key: 'r16', label: 'Octavos', ...half(r16), gap: '14px' },
    qf.length && { key: 'qf', label: 'Cuartos', ...half(qf), gap: '40px' },
    sf.length && { key: 'sf', label: 'Semi', ...half(sf), gap: '90px' },
  ].filter(Boolean) as any[]

  const seg = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      flex: 1, border: 'none', borderRadius: '999px', padding: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', fontFamily: 'Archivo',
      background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? 'var(--accent-ink)' : 'var(--muted)',
    }}>{label}</button>
  )

  return (
    <div className="risein">
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '6px 0 10px' }}>Fixture</h1>
      <div style={{ display: 'flex', gap: '6px', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: '999px', padding: '4px', marginBottom: '14px' }}>
        {seg('grupos', 'Grupos')}
        {seg('bracket', 'Bracket')}
      </div>

      {tab === 'grupos' && (
        <>
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, margin: '-4px 0 14px' }}>Los 2 primeros de cada grupo avanzan. <span style={{ color: 'var(--accent)', fontWeight: 800 }}>●</span> Clasifica</p>
          {Object.entries(byGroup).map(([g, gm]) => (
            <div key={g} className="card" style={{ padding: '14px 14px 6px', borderRadius: '18px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="font-display" style={{ fontSize: '16px', color: 'var(--ink)' }}>Grupo {g.replace('GROUP_', '')}</span>
                <span style={{ display: 'flex', gap: '14px', fontSize: '10px', fontWeight: 800, color: 'var(--muted)' }}><span>PJ</span><span>DG</span><span>PTS</span></span>
              </div>
              <GroupTable matches={gm} />
            </div>
          ))}
          {Object.keys(byGroup).length === 0 && <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Cargando grupos…</div>}
        </>
      )}

      {tab === 'bracket' && (
        <>
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, margin: '-4px 0 12px' }}>Eliminación directa · deslizá para ver toda la ruta →</p>
          {rounds.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Los cruces se definen al terminar la fase de grupos</div>
          ) : (
            <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 'max-content' }}>
                {rounds.map((rd: any) => (
                  <div key={'l' + rd.key} style={{ display: 'flex', flexDirection: 'column', gap: rd.gap }}>
                    <div className="font-display" style={{ fontSize: '12px', color: 'var(--accent)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.5px' }}>{rd.label}</div>
                    {rd.l.map((m: Match) => <BracketMatch key={m.id} m={m} />)}
                  </div>
                ))}
                {fin[0] && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div className="font-display" style={{ fontSize: '12px', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>★ Final</div>
                    <BracketMatch m={fin[0]} />
                  </div>
                )}
                {[...rounds].reverse().map((rd: any) => (
                  <div key={'r' + rd.key} style={{ display: 'flex', flexDirection: 'column', gap: rd.gap }}>
                    <div className="font-display" style={{ fontSize: '12px', color: 'var(--accent)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.5px' }}>{rd.label}</div>
                    {rd.r.map((m: Match) => <BracketMatch key={m.id} m={m} />)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
