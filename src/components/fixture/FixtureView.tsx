'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/types'

type Tab = 'grupos' | 'bracket'

function Flag({ url, code }: { url: string | null; code: string }) {
  if (url) return <img src={url} style={{ width: '22px', height: '15px', objectFit: 'contain', borderRadius: '2px', flexShrink: 0 }} alt={code} />
  return <span style={{ fontSize: '14px' }}>🏳️</span>
}

function BracketMatch({ match, highlight }: { match: Match; highlight?: boolean }) {
  const isFinished = match.status === 'FINISHED'
  const isLive = ['IN_PLAY', 'LIVE', 'PAUSED'].includes(match.status)
  const isTBD = !match.home_team || match.home_team === 'Por definir'
  const homeWon = isFinished && match.home_score! > match.away_score!
  const awayWon = isFinished && match.away_score! > match.home_score!

  return (
    <Link href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        width: '152px',
        background: isLive ? '#1a0808' : '#12121a',
        border: `1px solid ${isLive ? '#ef4444' : highlight ? '#f59e0b' : '#2a2a3e'}`,
        borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
        boxShadow: highlight ? '0 0 16px rgba(245,158,11,0.25)' : undefined,
        position: 'relative',
      }}>
        {highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />}
        {isLive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#ef4444,#f59e0b)' }} />}

        {/* Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 8px', borderBottom: '1px solid #1e1e2e', background: homeWon ? 'rgba(59,130,246,0.12)' : 'transparent' }}>
          {!isTBD && <Flag url={match.home_team_flag} code={match.home_team_code} />}
          <span style={{ flex: 1, fontSize: '11px', fontWeight: homeWon ? 800 : 500, color: isTBD ? '#374151' : '#f0f0f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isTBD ? 'Por definir' : match.home_team}
          </span>
          {(isFinished || isLive) && !isTBD && (
            <span style={{ fontWeight: 900, fontSize: '13px', color: homeWon ? '#fbbf24' : '#6b7280', flexShrink: 0 }}>{match.home_score ?? 0}</span>
          )}
        </div>

        {/* Away */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 8px', background: awayWon ? 'rgba(59,130,246,0.12)' : 'transparent' }}>
          {!isTBD && <Flag url={match.away_team_flag} code={match.away_team_code} />}
          <span style={{ flex: 1, fontSize: '11px', fontWeight: awayWon ? 800 : 500, color: isTBD ? '#374151' : '#f0f0f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isTBD ? 'Por definir' : match.away_team}
          </span>
          {(isFinished || isLive) && !isTBD && (
            <span style={{ fontWeight: 900, fontSize: '13px', color: awayWon ? '#fbbf24' : '#6b7280', flexShrink: 0 }}>{match.away_score ?? 0}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function GroupTable({ matches }: { matches: Match[] }) {
  const teams: Record<string, { name: string; flag: string | null; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }> = {}
  matches.forEach(m => {
    if (m.home_team !== 'Por definir') teams[m.home_team] = teams[m.home_team] || { name: m.home_team, flag: m.home_team_flag, played:0,won:0,drawn:0,lost:0,gf:0,ga:0,pts:0 }
    if (m.away_team !== 'Por definir') teams[m.away_team] = teams[m.away_team] || { name: m.away_team, flag: m.away_team_flag, played:0,won:0,drawn:0,lost:0,gf:0,ga:0,pts:0 }
    if (m.status !== 'FINISHED' || m.home_score === null || m.away_score === null) return
    if (!teams[m.home_team] || !teams[m.away_team]) return
    const h = m.home_score, a = m.away_score
    teams[m.home_team].played++; teams[m.away_team].played++
    teams[m.home_team].gf += h; teams[m.home_team].ga += a
    teams[m.away_team].gf += a; teams[m.away_team].ga += h
    if (h > a) { teams[m.home_team].won++; teams[m.home_team].pts += 3; teams[m.away_team].lost++ }
    else if (h < a) { teams[m.away_team].won++; teams[m.away_team].pts += 3; teams[m.home_team].lost++ }
    else { teams[m.home_team].drawn++; teams[m.home_team].pts++; teams[m.away_team].drawn++; teams[m.away_team].pts++ }
  })
  const sorted = Object.values(teams).sort((a,b) => b.pts - a.pts || (b.gf-b.ga)-(a.gf-a.ga))
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 22px 22px 22px 22px 26px', gap: '2px', padding: '4px 8px', borderBottom: '1px solid #1e1e2e' }}>
        {['','PJ','G','E','P','Pts'].map((h,i) => <span key={i} style={{ color: '#374151', fontSize: '10px', fontWeight: 700, textAlign: i===0?'left':'center' }}>{h}</span>)}
      </div>
      {sorted.map((t,i) => (
        <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '1fr 22px 22px 22px 22px 26px', gap: '2px', padding: '5px 8px', borderBottom: '1px solid #0a0a0f', background: i<2?'rgba(59,130,246,0.05)':'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '3px', height: '14px', background: i<2?'#3b82f6':i===2?'#f59e0b':'transparent', borderRadius: '2px', flexShrink: 0 }} />
            <Flag url={t.flag} code={t.name} />
            <span style={{ color: '#f0f0f5', fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
          </div>
          {[t.played,t.won,t.drawn,t.lost].map((v,j) => <span key={j} style={{ color: '#6b7280', fontSize: '10px', textAlign: 'center' }}>{v}</span>)}
          <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 800, textAlign: 'center' }}>{t.pts}</span>
        </div>
      ))}
    </div>
  )
}

// Conector SVG entre partidos del bracket
function Connector({ height }: { height: number }) {
  return (
    <svg width="24" height={height} style={{ flexShrink: 0 }}>
      <line x1="0" y1={height/4} x2="12" y2={height/4} stroke="#2a2a3e" strokeWidth="1.5" />
      <line x1="12" y1={height/4} x2="12" y2={height*3/4} stroke="#2a2a3e" strokeWidth="1.5" />
      <line x1="12" y1={height*3/4} x2="0" y2={height*3/4} stroke="#2a2a3e" strokeWidth="1.5" />
      <line x1="12" y1={height/2} x2="24" y2={height/2} stroke="#2a2a3e" strokeWidth="1.5" />
    </svg>
  )
}
function ConnectorRight({ height }: { height: number }) {
  return (
    <svg width="24" height={height} style={{ flexShrink: 0 }}>
      <line x1="24" y1={height/4} x2="12" y2={height/4} stroke="#2a2a3e" strokeWidth="1.5" />
      <line x1="12" y1={height/4} x2="12" y2={height*3/4} stroke="#2a2a3e" strokeWidth="1.5" />
      <line x1="12" y1={height*3/4} x2="24" y2={height*3/4} stroke="#2a2a3e" strokeWidth="1.5" />
      <line x1="12" y1={height/2} x2="0" y2={height/2} stroke="#2a2a3e" strokeWidth="1.5" />
    </svg>
  )
}

function BracketColumn({ matches, label, isLeft, connectorHeight, highlight }: {
  matches: Match[]; label: string; isLeft: boolean; connectorHeight: number; highlight?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
      <div style={{ color: highlight ? '#f59e0b' : '#6b7280', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', textAlign: 'center', width: '152px' }}>
        {highlight ? '🏆 ' : ''}{label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {matches.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: i < matches.length - 1 ? `${connectorHeight - 54}px` : '0' }}>
            {!isLeft && <div style={{ width: '24px' }} />}
            <BracketMatch match={m} highlight={highlight} />
            {isLeft && <div style={{ width: '24px' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FixtureView({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState<Tab>('grupos')

  const groups = ['GROUP_A','GROUP_B','GROUP_C','GROUP_D','GROUP_E','GROUP_F','GROUP_G','GROUP_H','GROUP_I','GROUP_J','GROUP_K','GROUP_L']
  const byGroup = groups.reduce((acc, g) => {
    const gm = matches.filter(m => m.group_name === g)
    if (gm.length) acc[g] = gm
    return acc
  }, {} as Record<string, Match[]>)

  // Knockout matches
  const r32 = matches.filter(m => m.stage === 'LAST_32')
  const r16 = matches.filter(m => m.stage === 'LAST_16')
  const qf  = matches.filter(m => m.stage === 'QUARTER_FINALS')
  const sf  = matches.filter(m => m.stage === 'SEMI_FINALS')
  const fin = matches.filter(m => m.stage === 'FINAL')
  const tp  = matches.filter(m => m.stage === 'THIRD_PLACE')

  // Split each round into left/right halves
  const half = (arr: Match[]) => ({ left: arr.slice(0, Math.ceil(arr.length/2)), right: arr.slice(Math.ceil(arr.length/2)) })

  const r32h = half(r32)
  const r16h = half(r16)
  const qfh  = half(qf)
  const sfh  = half(sf)

  const finished = matches.filter(m => m.status === 'FINISHED').length
  const liveMatches = matches.filter(m => ['IN_PLAY','LIVE','PAUSED'].includes(m.status))

  const champion = fin[0]?.status === 'FINISHED'
    ? (fin[0].home_score! > fin[0].away_score! ? { name: fin[0].home_team, flag: fin[0].home_team_flag } : { name: fin[0].away_team, flag: fin[0].away_team_flag })
    : null

  // Determine which rounds to show based on available data
  const rounds = [
    r32.length > 0 && { key: 'r32', label: 'Ronda 32', left: r32h.left, right: r32h.right, gap: 8 },
    r16.length > 0 && { key: 'r16', label: 'Octavos', left: r16h.left, right: r16h.right, gap: 16 },
    qf.length > 0  && { key: 'qf',  label: 'Cuartos', left: qfh.left,  right: qfh.right,  gap: 32 },
    sf.length > 0  && { key: 'sf',  label: 'Semis',   left: sfh.left,  right: sfh.right,  gap: 64 },
  ].filter(Boolean) as Array<{ key: string; label: string; left: Match[]; right: Match[]; gap: number }>

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#003087,#0050c8)', borderRadius: '16px', padding: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent 0px,transparent 18px,rgba(255,255,255,0.05) 18px,rgba(255,255,255,0.05) 36px)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem', color: '#fff' }}>🗓️ Fixture</h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>FIFA World Cup 2026</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.3rem' }}>{finished}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>jugados</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem' }}>{matches.length}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>total</div>
            </div>
          </div>
        </div>
      </div>

      {/* En vivo */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: '16px', background: '#1a0808', border: '1px solid #ef444444', borderRadius: '12px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
            <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>EN VIVO</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {liveMatches.map(m => <BracketMatch key={m.id} match={m} />)}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#0a0a0f', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
        {([['grupos','⚽ Grupos'],['bracket','⚔️ Bracket']] as const).map(([v,label]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex:1, padding:'10px', borderRadius:'8px', border:'none', cursor:'pointer',
            background: tab===v ? '#1e1e2e' : 'transparent',
            color: tab===v ? '#f0f0f5' : '#6b7280',
            fontWeight: tab===v ? 700 : 400, fontSize:'14px', transition:'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* GRUPOS */}
      {tab === 'grupos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Object.entries(byGroup).map(([group, gMatches]) => (
            <div key={group} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'linear-gradient(90deg,#003087,#0050c8)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px' }}>{group.replace('GROUP_','Grupo ')}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{gMatches.filter(m=>m.status==='FINISHED').length}/{gMatches.length}</span>
              </div>
              <div style={{ padding: '10px' }}>
                <GroupTable matches={gMatches} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {gMatches.map(m => (
                    <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: m.status==='FINISHED'?'#0a0a0f':'#1e1e2e', borderRadius: '8px', padding: '7px 10px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Flag url={m.home_team_flag} code={m.home_team_code} />
                          <span style={{ fontSize: '11px', color: '#f0f0f5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home_team}</span>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '40px' }}>
                          {m.status==='FINISHED' ? <span style={{ fontWeight:900, fontSize:'13px', color:'#fff' }}>{m.home_score}-{m.away_score}</span> : <span style={{ fontSize:'10px', color:'#374151' }}>vs</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '11px', color: '#f0f0f5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{m.away_team}</span>
                          <Flag url={m.away_team_flag} code={m.away_team_code} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BRACKET */}
      {tab === 'bracket' && (
        <div>
          <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>← Deslizá para ver el bracket completo →</p>
          <div style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', minWidth: 'max-content', position: 'relative' }}>

              {/* LADO IZQUIERDO */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {rounds.map((round, ri) => (
                  <div key={round.key} style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Columna izquierda */}
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', textAlign: 'center', width: '152px' }}>
                        {round.label}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: `${round.gap * 2}px` }}>
                        {round.left.map(m => <BracketMatch key={m.id} match={m} />)}
                      </div>
                    </div>
                    {/* Conector hacia la siguiente ronda */}
                    {ri < rounds.length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: `${round.gap * 4 + 54}px`, paddingTop: `${round.gap + 27}px` }}>
                        {round.left.filter((_,i) => i % 2 === 0).map((_, i) => (
                          <Connector key={i} height={54 + round.gap * 2} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* FINAL - CENTRO */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
                {/* Líneas hacia la final */}
                <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🏆 Final</div>
                {fin.length > 0 && <BracketMatch match={fin[0]} highlight />}

                {/* Campeón */}
                {champion && (
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>CAMPEÓN</div>
                    <div style={{ background: 'linear-gradient(135deg,#1a1200,#2a1f00)', border: '2px solid #f59e0b', borderRadius: '12px', padding: '14px 20px', boxShadow: '0 0 24px rgba(245,158,11,0.4)', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', marginBottom: '6px' }}>🏆</div>
                      {champion.flag && <img src={champion.flag} style={{ width: '36px', height: '25px', objectFit: 'contain', display: 'block', margin: '0 auto 6px' }} alt="" />}
                      <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: '13px' }}>{champion.name}</div>
                    </div>
                  </div>
                )}

                {/* Tercer puesto */}
                {tp.length > 0 && (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <div style={{ color: '#cd7f32', fontSize: '10px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase' }}>🥉 3er Puesto</div>
                    <BracketMatch match={tp[0]} />
                  </div>
                )}
              </div>

              {/* LADO DERECHO (espejo) */}
              <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row-reverse' }}>
                {rounds.map((round, ri) => (
                  <div key={round.key} style={{ display: 'flex', alignItems: 'center', flexDirection: 'row-reverse' }}>
                    <div>
                      <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', textAlign: 'center', width: '152px' }}>
                        {round.label}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: `${round.gap * 2}px` }}>
                        {round.right.map(m => <BracketMatch key={m.id} match={m} />)}
                      </div>
                    </div>
                    {ri < rounds.length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: `${round.gap * 4 + 54}px`, paddingTop: `${round.gap + 27}px` }}>
                        {round.right.filter((_,i) => i % 2 === 0).map((_, i) => (
                          <ConnectorRight key={i} height={54 + round.gap * 2} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
