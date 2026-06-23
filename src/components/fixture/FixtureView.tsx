'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/types'

type Tab = 'grupos' | 'bracket'

const STAGE_ORDER = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']
const STAGE_LABEL: Record<string, string> = {
  LAST_32:        'R32',
  LAST_16:        'Octavos',
  QUARTER_FINALS: 'Cuartos',
  SEMI_FINALS:    'Semis',
  FINAL:          'Final',
}

function Flag({ url, code }: { url: string | null; code: string }) {
  if (url) return <img src={url} style={{ width: '20px', height: '14px', objectFit: 'contain', borderRadius: '2px', flexShrink: 0 }} alt={code} />
  return <span style={{ fontSize: '14px' }}>🏳️</span>
}

function BracketMatch({ match, isLast }: { match: Match; isLast?: boolean }) {
  const isFinished = match.status === 'FINISHED'
  const isLive = ['IN_PLAY', 'LIVE', 'PAUSED'].includes(match.status)
  const isTBD = !match.home_team || match.home_team === 'Por definir'
  const homeWon = isFinished && match.home_score !== null && match.away_score !== null && match.home_score > match.away_score
  const awayWon = isFinished && match.home_score !== null && match.away_score !== null && match.away_score > match.home_score

  return (
    <Link href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: isLive ? '#1a0808' : '#12121a',
        border: `1px solid ${isLive ? '#ef4444' : isFinished ? '#2a2a3e' : '#1e1e2e'}`,
        borderRadius: '10px', overflow: 'hidden', width: '160px',
        boxShadow: isLast ? '0 0 20px rgba(245,158,11,0.3)' : undefined,
        cursor: 'pointer', position: 'relative',
      }}>
        {isLast && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)' }} />}
        {isLive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#ef4444,#f59e0b)' }} />}

        {/* Home */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 8px',
          borderBottom: '1px solid #1e1e2e',
          background: homeWon ? 'rgba(59,130,246,0.1)' : 'transparent',
        }}>
          {!isTBD && <Flag url={match.home_team_flag} code={match.home_team_code} />}
          <span style={{
            flex: 1, fontSize: '11px', fontWeight: homeWon ? 800 : 500,
            color: isTBD ? '#374151' : homeWon ? '#fff' : '#94a3b8',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isTBD ? 'Por definir' : match.home_team}
          </span>
          {(isFinished || isLive) && !isTBD && (
            <span style={{ fontWeight: 900, fontSize: '13px', color: homeWon ? '#fbbf24' : '#6b7280', flexShrink: 0 }}>
              {match.home_score ?? 0}
            </span>
          )}
        </div>

        {/* Away */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 8px',
          background: awayWon ? 'rgba(59,130,246,0.1)' : 'transparent',
        }}>
          {!isTBD && <Flag url={match.away_team_flag} code={match.away_team_code} />}
          <span style={{
            flex: 1, fontSize: '11px', fontWeight: awayWon ? 800 : 500,
            color: isTBD ? '#374151' : awayWon ? '#fff' : '#94a3b8',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isTBD ? 'Por definir' : match.away_team}
          </span>
          {(isFinished || isLive) && !isTBD && (
            <span style={{ fontWeight: 900, fontSize: '13px', color: awayWon ? '#fbbf24' : '#6b7280', flexShrink: 0 }}>
              {match.away_score ?? 0}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function GroupTable({ matches }: { matches: Match[] }) {
  const teams: Record<string, { name: string; flag: string | null; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }> = {}

  // Inicializar todos los equipos que aparecen en el grupo
  matches.forEach(m => {
    if (!teams[m.home_team] && m.home_team !== 'Por definir')
      teams[m.home_team] = { name: m.home_team, flag: m.home_team_flag, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }
    if (!teams[m.away_team] && m.away_team !== 'Por definir')
      teams[m.away_team] = { name: m.away_team, flag: m.away_team_flag, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }
  })

  matches.forEach(m => {
    if (m.status !== 'FINISHED' || m.home_score === null || m.away_score === null) return
    const h = m.home_score, a = m.away_score
    if (!teams[m.home_team] || !teams[m.away_team]) return
    teams[m.home_team].played++; teams[m.away_team].played++
    teams[m.home_team].gf += h; teams[m.home_team].ga += a
    teams[m.away_team].gf += a; teams[m.away_team].ga += h
    if (h > a) { teams[m.home_team].won++; teams[m.home_team].pts += 3; teams[m.away_team].lost++ }
    else if (h < a) { teams[m.away_team].won++; teams[m.away_team].pts += 3; teams[m.home_team].lost++ }
    else { teams[m.home_team].drawn++; teams[m.home_team].pts++; teams[m.away_team].drawn++; teams[m.away_team].pts++ }
  })

  const sorted = Object.values(teams).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga))

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 24px 24px 24px 28px', gap: '2px', padding: '4px 8px', borderBottom: '1px solid #1e1e2e' }}>
        {['', 'PJ', 'G', 'E', 'P', 'Pts'].map((h, i) => (
          <span key={i} style={{ color: '#374151', fontSize: '10px', fontWeight: 700, textAlign: i === 0 ? 'left' : 'center' }}>{h}</span>
        ))}
      </div>
      {sorted.map((t, i) => (
        <div key={t.name} style={{
          display: 'grid', gridTemplateColumns: '1fr 24px 24px 24px 24px 28px',
          gap: '2px', padding: '6px 8px', borderBottom: '1px solid #0a0a0f',
          background: i < 2 ? 'rgba(59,130,246,0.06)' : 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '3px', height: '14px', background: i < 2 ? '#3b82f6' : i === 2 ? '#f59e0b' : 'transparent', borderRadius: '2px', flexShrink: 0 }} />
            <Flag url={t.flag} code={t.name} />
            <span style={{ color: '#f0f0f5', fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
          </div>
          {[t.played, t.won, t.drawn, t.lost].map((v, j) => (
            <span key={j} style={{ color: '#6b7280', fontSize: '10px', textAlign: 'center' }}>{v}</span>
          ))}
          <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 800, textAlign: 'center' }}>{t.pts}</span>
        </div>
      ))}
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

  const byStage = STAGE_ORDER.reduce((acc, s) => {
    const sm = matches.filter(m => m.stage === s)
    if (sm.length) acc[s] = sm
    return acc
  }, {} as Record<string, Match[]>)

  const finished = matches.filter(m => m.status === 'FINISHED').length
  const liveMatches = matches.filter(m => ['IN_PLAY','LIVE','PAUSED'].includes(m.status))

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #003087, #0050c8)',
        borderRadius: '16px', padding: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(255,255,255,0.05) 18px, rgba(255,255,255,0.05) 36px)' }} />
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
        {([['grupos', '⚽ Grupos'], ['bracket', '⚔️ Bracket']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === v ? '#1e1e2e' : 'transparent',
            color: tab === v ? '#f0f0f5' : '#6b7280',
            fontWeight: tab === v ? 700 : 400, fontSize: '14px', transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* GRUPOS */}
      {tab === 'grupos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Object.entries(byGroup).map(([group, gMatches]) => (
            <div key={group} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'linear-gradient(90deg,#003087,#0050c8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px' }}>
                  {group.replace('GROUP_', 'Grupo ')}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                  {gMatches.filter(m => m.status === 'FINISHED').length}/{gMatches.length}
                </span>
              </div>
              <div style={{ padding: '10px' }}>
                <GroupTable matches={gMatches} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {gMatches.map(m => (
                    <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: m.status === 'FINISHED' ? '#0a0a0f' : '#1e1e2e',
                        borderRadius: '8px', padding: '7px 10px',
                        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '6px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Flag url={m.home_team_flag} code={m.home_team_code} />
                          <span style={{ fontSize: '11px', color: '#f0f0f5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home_team}</span>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '40px' }}>
                          {m.status === 'FINISHED'
                            ? <span style={{ fontWeight: 900, fontSize: '13px', color: '#fff' }}>{m.home_score}-{m.away_score}</span>
                            : <span style={{ fontSize: '10px', color: '#374151' }}>vs</span>
                          }
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
          <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
            Deslizá para ver el bracket completo →
          </p>
          <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '0', minWidth: 'max-content', alignItems: 'center' }}>

              {STAGE_ORDER.map((stage, stageIdx) => {
                const stageMatches = byStage[stage] || []
                const isLast = stage === 'FINAL'
                const totalStages = STAGE_ORDER.filter(s => byStage[s]).length
                const currentIdx = STAGE_ORDER.filter(s => byStage[s]).indexOf(stage)

                return (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Columna de etapa */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* Label de la etapa */}
                      <div style={{
                        color: isLast ? '#f59e0b' : '#6b7280',
                        fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '1px', marginBottom: '12px', textAlign: 'center',
                        width: '170px',
                      }}>
                        {isLast ? '🏆 ' : ''}{STAGE_LABEL[stage] || stage}
                      </div>

                      {/* Partidos de esta etapa */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: isLast ? '0' : '16px', justifyContent: 'space-around' }}>
                        {stageMatches.map((m, i) => (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <BracketMatch match={m} isLast={isLast} />
                          </div>
                        ))}
                        {stageMatches.length === 0 && (
                          <div style={{ width: '160px', height: '60px', background: '#0a0a0f', border: '1px dashed #1e1e2e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#374151', fontSize: '11px' }}>Por definir</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conector entre etapas */}
                    {currentIdx < totalStages - 1 && (
                      <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }}>
                        <div style={{ width: '24px', height: '2px', background: 'linear-gradient(90deg, #1e1e2e, #2a2a3e)' }} />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Campeón */}
              {byStage['FINAL']?.[0]?.status === 'FINISHED' && (() => {
                const final = byStage['FINAL'][0]
                const champion = final.home_score! > final.away_score! ? final.home_team : final.away_team
                const championFlag = final.home_score! > final.away_score! ? final.home_team_flag : final.away_team_flag
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '24px' }}>
                    <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 800, marginBottom: '12px' }}>CAMPEÓN</div>
                    <div style={{
                      background: 'linear-gradient(135deg, #1a1200, #2a1f00)',
                      border: '2px solid #f59e0b',
                      borderRadius: '12px', padding: '16px',
                      textAlign: 'center', width: '120px',
                      boxShadow: '0 0 24px rgba(245,158,11,0.4)',
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '6px' }}>🏆</div>
                      {championFlag && <img src={championFlag} style={{ width: '40px', height: '28px', objectFit: 'contain', marginBottom: '6px' }} alt="" />}
                      <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: '12px' }}>{champion}</div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Tercer puesto */}
          {byStage['THIRD_PLACE'] && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ textAlign: 'center', color: '#cd7f32', fontSize: '12px', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🥉 Tercer Puesto
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {byStage['THIRD_PLACE'].map(m => <BracketMatch key={m.id} match={m} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
