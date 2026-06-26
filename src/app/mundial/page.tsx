import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TeamAvatar from '@/components/ui/TeamAvatar'
import { matchLabel } from '@/lib/utils'

export const revalidate = 0

export default async function MundialPage() {
  const supabase = await createClient()

  // Partidos de hoy (hora Argentina)
  const now = new Date()
  const startAR = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  startAR.setHours(0, 0, 0, 0)
  const endAR = new Date(startAR); endAR.setDate(endAR.getDate() + 1)

  const { data: todays } = await supabase
    .from('matches').select('*')
    .gte('match_date', startAR.toISOString())
    .lt('match_date', endAR.toISOString())
    .order('match_date')

  const cards = [
    { href: '/mundial/goleadores', emoji: '⚽', title: 'Goleadores', desc: 'Tabla de máximos artilleros', grad: 'linear-gradient(135deg,#1a1200,#2a1f00)', bd: '#f59e0b44' },
    { href: '/mundial/argentina', emoji: '🇦🇷', title: 'Camino de Argentina', desc: 'Cómo viene la Scaloneta', grad: 'linear-gradient(135deg,#001a4d,#0050c8)', bd: '#5FB1FF44' },
    { href: '/mundial/simulador', emoji: '🔮', title: 'Simulador', desc: '¿Qué pasa si...?', grad: 'linear-gradient(135deg,#1a0a2e,#2d1b4e)', bd: '#a78bfa44' },
    { href: '/mundial/sedes', emoji: '🏟️', title: 'Sedes y estadios', desc: 'USA · Canadá · México', grad: 'linear-gradient(135deg,#0a1a0a,#0f2e0f)', bd: '#10b98144' },
    { href: '/mundial/reglas', emoji: '📖', title: 'Cómo se juega', desc: 'Reglas y puntos explicados', grad: 'linear-gradient(135deg,#2a1f00,#3d2d00)', bd: '#f59e0b44' },
  ]

  return (
    <div className="risein">
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '6px 0 4px' }}>🌎 Mundial</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '16px' }}>Todo sobre el Mundial 2026</p>

      {/* Partidos de hoy */}
      <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)', margin: '0 0 10px' }}>📅 Hoy juegan</h2>
      {!todays || todays.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', marginBottom: '20px' }}>No hay partidos hoy</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {todays.map((m: any) => {
            const live = ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status)
            const fin = m.status === 'FINISHED'
            return (
              <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '12px 14px', borderColor: live ? 'var(--neg)' : 'var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', background: 'var(--surface2)', padding: '3px 8px', borderRadius: '999px' }}>{matchLabel(m.group_name, m.stage)}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: live ? 'var(--neg)' : 'var(--muted)' }}>
                      {live ? 'EN VIVO' : fin ? 'Final' : new Date(m.match_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }) + ' hs'}
                    </span>
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

      {/* Secciones */}
      <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)', margin: '0 0 10px' }}>Explorá</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {cards.map(c => (
          <Link key={c.href} href={c.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: c.grad, border: `1px solid ${c.bd}`, borderRadius: '16px', padding: '16px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '28px' }}>{c.emoji}</div>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '14px' }}>{c.title}</div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', marginTop: '2px' }}>{c.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
