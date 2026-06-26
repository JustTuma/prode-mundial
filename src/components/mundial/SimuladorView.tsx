'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { teamColor, teamCode } from '@/lib/teams'
import type { Match } from '@/lib/types'

type Pick = 'H' | 'D' | 'A'

export default function SimuladorView({ matches }: { matches: Match[] }) {
  const groups = useMemo(() => {
    const g: Record<string, Match[]> = {}
    for (const m of matches) { if (m.group_name) { (g[m.group_name] ||= []).push(m) } }
    return g
  }, [matches])
  const groupKeys = Object.keys(groups).sort()
  const [group, setGroup] = useState(groupKeys[0] || '')
  const [picks, setPicks] = useState<Record<number, Pick>>({})

  const gm = groups[group] || []
  const pending = gm.filter(m => m.status !== 'FINISHED')

  // Calcular tabla con resultados reales + hipotéticos
  const table = useMemo(() => {
    const t: Record<string, { code: string; flag: string | null; pts: number; dg: number; gf: number }> = {}
    const ensure = (name: string, code: string | null, flag: string | null) => {
      if (name && name !== 'Por definir' && !t[name]) t[name] = { code: teamCode(name, code), flag: flag || null, pts: 0, dg: 0, gf: 0 }
    }
    for (const m of gm) {
      ensure(m.home_team, m.home_team_code, m.home_team_flag)
      ensure(m.away_team, m.away_team_code, m.away_team_flag)
      let res: Pick | null = null
      if (m.status === 'FINISHED' && m.home_score != null) {
        res = m.home_score > m.away_score! ? 'H' : m.home_score < m.away_score! ? 'A' : 'D'
        if (t[m.home_team]) { t[m.home_team].gf += m.home_score; t[m.home_team].dg += m.home_score - m.away_score! }
        if (t[m.away_team]) { t[m.away_team].gf += m.away_score!; t[m.away_team].dg += m.away_score! - m.home_score }
      } else if (picks[m.id]) {
        res = picks[m.id]
      }
      if (!res || !t[m.home_team] || !t[m.away_team]) continue
      if (res === 'H') t[m.home_team].pts += 3
      else if (res === 'A') t[m.away_team].pts += 3
      else { t[m.home_team].pts++; t[m.away_team].pts++ }
    }
    return Object.entries(t).map(([n, v]) => ({ n, ...v })).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
  }, [gm, picks])

  return (
    <div className="risein">
      <Link href="/mundial" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>← Mundial</Link>
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '8px 0 4px' }}>🔮 Simulador</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '16px' }}>Probá resultados y mirá cómo queda el grupo</p>

      {/* Selector de grupo */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '2px' }}>
        {groupKeys.map(k => (
          <button key={k} onClick={() => setGroup(k)} style={{
            flexShrink: 0, border: '1px solid var(--line)', borderRadius: '999px', padding: '8px 14px',
            fontWeight: 800, fontSize: '13px', cursor: 'pointer', fontFamily: 'Archivo',
            background: group === k ? 'var(--accent)' : 'var(--surface)', color: group === k ? 'var(--accent-ink)' : 'var(--muted)',
          }}>{k.replace('GROUP_', 'Grupo ')}</button>
        ))}
      </div>

      {/* Tabla simulada */}
      <div className="card" style={{ padding: '12px 14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="font-display" style={{ fontSize: '15px', color: 'var(--ink)' }}>Tabla proyectada</span>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)' }}>DG · PTS</span>
        </div>
        {table.map((r, i) => (
          <div key={r.n} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: i < 2 ? 'var(--surface2)' : 'transparent', borderLeft: `3px solid ${i < 2 ? 'var(--pos)' : 'transparent'}`, marginBottom: '3px' }}>
            <span className="font-display" style={{ width: '14px', fontSize: '13px', color: 'var(--muted)' }}>{i + 1}</span>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: teamColor(r.code), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: '9px', flexShrink: 0, overflow: 'hidden' }}>
              {r.flag ? <img src={r.flag} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.code}
            </div>
            <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.n}</span>
            <span style={{ width: '28px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>{r.dg > 0 ? '+' : ''}{r.dg}</span>
            <span className="font-display" style={{ width: '24px', textAlign: 'center', fontSize: '15px', color: 'var(--ink)' }}>{r.pts}</span>
          </div>
        ))}
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '6px', paddingLeft: '8px' }}><span style={{ color: 'var(--pos)' }}>●</span> Clasifican los 2 primeros</div>
      </div>

      {/* Partidos pendientes para simular */}
      <h2 className="font-display" style={{ fontSize: '16px', color: 'var(--ink)', margin: '0 0 10px' }}>Partidos por jugar</h2>
      {pending.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>El grupo ya está completo</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pending.map(m => {
            const pick = picks[m.id]
            const opt = (v: Pick, label: string) => (
              <button onClick={() => setPicks(p => ({ ...p, [m.id]: v }))} style={{
                flex: 1, border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 4px', cursor: 'pointer',
                fontSize: '11px', fontWeight: 800, fontFamily: 'Archivo',
                background: pick === v ? 'var(--accent)' : 'var(--surface2)', color: pick === v ? 'var(--accent-ink)' : 'var(--muted)',
              }}>{label}</button>
            )
            return (
              <div key={m.id} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                  {teamCode(m.home_team, m.home_team_code)} <span style={{ color: 'var(--muted)' }}>vs</span> {teamCode(m.away_team, m.away_team_code)}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {opt('H', `Gana ${teamCode(m.home_team, m.home_team_code)}`)}
                  {opt('D', 'Empate')}
                  {opt('A', `Gana ${teamCode(m.away_team, m.away_team_code)}`)}
                </div>
              </div>
            )
          })}
          {Object.keys(picks).length > 0 && (
            <button onClick={() => setPicks({})} className="btn-accent" style={{ background: 'var(--surface2)', color: 'var(--muted)', marginTop: '4px' }}>Reiniciar simulación</button>
          )}
        </div>
      )}
    </div>
  )
}
