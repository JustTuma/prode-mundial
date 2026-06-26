import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TeamAvatar from '@/components/ui/TeamAvatar'
import { matchLabel } from '@/lib/utils'

export const revalidate = 0

const ARG = ['argentina']

export default async function ArgentinaPage() {
  const supabase = await createClient()
  const { data: all } = await supabase.from('matches').select('*').order('match_date')
  const matches = (all || []).filter((m: any) =>
    ARG.includes((m.home_team || '').toLowerCase()) || ARG.includes((m.away_team || '').toLowerCase()))

  // Stats de Argentina en fase de grupos
  let pj = 0, g = 0, e = 0, p = 0, gf = 0, gc = 0
  for (const m of matches) {
    if (m.status !== 'FINISHED' || m.home_score == null) continue
    const isHome = (m.home_team || '').toLowerCase() === 'argentina'
    const my = isHome ? m.home_score : m.away_score
    const opp = isHome ? m.away_score : m.home_score
    pj++; gf += my; gc += opp
    if (my > opp) g++; else if (my === opp) e++; else p++
  }
  const pts = g * 3 + e

  return (
    <div className="risein">
      <Link href="/mundial" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>← Mundial</Link>
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '8px 0 4px' }}>🇦🇷 Camino de Argentina</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '16px' }}>La Scaloneta en el Mundial 2026</p>

      {/* Resumen */}
      <div className="card" style={{ padding: '18px', marginBottom: '20px', background: 'var(--grad)', border: 'none', color: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', textAlign: 'center' }}>
          {[{ v: pts, l: 'Puntos' }, { v: `${g}-${e}-${p}`, l: 'G-E-P' }, { v: gf, l: 'GF' }, { v: gc, l: 'GC' }].map(s => (
            <div key={s.l}>
              <div className="font-display" style={{ fontSize: '24px' }}>{s.v}</div>
              <div style={{ fontSize: '10px', opacity: .8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partidos */}
      <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)', margin: '0 0 10px' }}>Partidos</h2>
      {matches.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Sin partidos cargados todavía</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {matches.map((m: any) => {
            const fin = m.status === 'FINISHED'
            const live = ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status)
            return (
              <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '12px 14px', borderColor: live ? 'var(--neg)' : 'var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', background: 'var(--surface2)', padding: '3px 8px', borderRadius: '999px' }}>{matchLabel(m.group_name, m.stage)}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)' }}>{new Date(m.match_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' })}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TeamAvatar name={m.home_team} code={m.home_team_code} flag={m.home_team_flag} size={30} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home_team}</span>
                    </div>
                    <span className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>{fin || live ? `${m.home_score ?? 0}-${m.away_score ?? 0}` : 'vs'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{m.away_team}</span>
                      <TeamAvatar name={m.away_team} code={m.away_team_code} flag={m.away_team_flag} size={30} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
