import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { teamColor, teamCode } from '@/lib/teams'

export const revalidate = 0

export default async function GoleadoresPage() {
  const supabase = await createClient()
  const [scorersRes, matchesRes] = await Promise.all([
    supabase.from('scorers').select('*').order('position').limit(30),
    supabase.from('matches').select('home_team, home_team_flag, away_team, away_team_flag'),
  ])
  const scorers = scorersRes.data
  // Mapa nombre de selección -> bandera
  const flagOf: Record<string, string> = {}
  for (const m of (matchesRes.data || [])) {
    if (m.home_team && m.home_team_flag) flagOf[m.home_team.toLowerCase()] = m.home_team_flag
    if (m.away_team && m.away_team_flag) flagOf[m.away_team.toLowerCase()] = m.away_team_flag
  }
  // Inglés -> español para cruzar con nuestros nombres
  const trans: Record<string, string> = {
    brazil: 'brasil', france: 'francia', germany: 'alemania', spain: 'españa', england: 'inglaterra',
    portugal: 'portugal', netherlands: 'países bajos', 'south korea': 'corea del sur', japan: 'japón',
    morocco: 'marruecos', switzerland: 'suiza', croatia: 'croacia', mexico: 'méxico', uruguay: 'uruguay',
    colombia: 'colombia', senegal: 'senegal', nigeria: 'nigeria', norway: 'noruega', belgium: 'bélgica',
    italy: 'italia', 'united states': 'estados unidos', ecuador: 'ecuador', ghana: 'ghana',
  }
  const flagFor = (team: string | null) => {
    if (!team) return null
    const t = team.toLowerCase()
    return flagOf[t] || flagOf[trans[t]] || null
  }

  return (
    <div className="risein">
      <Link href="/mundial" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>← Mundial</Link>
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '8px 0 4px' }}>⚽ Goleadores</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '16px' }}>Máximos artilleros del Mundial 2026</p>

      {!scorers || scorers.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
          Todavía no hay datos de goleadores · se actualizan con los partidos
        </div>
      ) : (
        <div className="card" style={{ padding: '4px 14px' }}>
          {scorers.map((s: any, i: number) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
            const code = teamCode(s.team_name, s.team_code)
            const flag = flagFor(s.team_name)
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < scorers.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span className="font-display" style={{ width: '22px', fontSize: '15px', color: medal ? 'var(--accent2)' : 'var(--muted)', textAlign: 'center' }}>{medal || i + 1}</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: teamColor(code), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: '11px', flexShrink: 0, overflow: 'hidden' }}>{flag ? <img src={flag} alt={code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : code}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.player_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.team_name}{s.assists > 0 ? ` · ${s.assists} asist.` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="font-display" style={{ fontSize: '22px', color: 'var(--accent)' }}>{s.goals}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}> {s.goals === 1 ? 'gol' : 'goles'}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
