'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/types'

type Tab = 'grupos' | 'eliminatorias'

const STAGE_ORDER = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']
const STAGE_LABEL: Record<string, string> = {
  LAST_32:       'Ronda de 32',
  LAST_16:       'Octavos de Final',
  QUARTER_FINALS:'Cuartos de Final',
  SEMI_FINALS:   'Semifinales',
  THIRD_PLACE:   'Tercer Puesto',
  FINAL:         'Gran Final 🏆',
}

function Flag({ url, code }: { url: string | null; code: string }) {
  if (url) return <img src={url} style={{ width: '24px', height: '17px', objectFit: 'contain', borderRadius: '2px', flexShrink: 0 }} alt={code} />
  return <span style={{ fontSize: '18px', lineHeight: 1 }}>🏳️</span>
}

function MatchCard({ match, compact = false }: { match: Match; compact?: boolean }) {
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'IN_PLAY' || match.status === 'LIVE' || match.status === 'PAUSED'
  const isTBD = match.home_team === 'Por definir'

  return (
    <Link href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: isLive ? '#1a0808' : isFinished ? '#0f0f0f' : '#12121a',
        border: `1px solid ${isLive ? '#ef444466' : isFinished ? '#2a2a3e' : '#1e1e2e'}`,
        borderRadius: '10px', padding: compact ? '10px 12px' : '12px 14px',
        cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative', overflow: 'hidden',
      }}>
        {isLive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#ef4444,#f59e0b)' }} />}

        {/* Fecha */}
        {!compact && (
          <div style={{ color: '#374151', fontSize: '10px', marginBottom: '6px' }}>
            {new Date(match.match_date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {match.city && ` · ${match.city}`}
          </div>
        )}

        {/* Equipos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Local */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            <Flag url={match.home_team_flag} code={match.home_team_code} />
            <span style={{
              fontWeight: isTBD ? 400 : 600, color: isTBD ? '#374151' : '#f0f0f5',
              fontSize: compact ? '12px' : '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {match.home_team}
            </span>
          </div>

          {/* Marcador */}
          <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '52px' }}>
            {isFinished || isLive ? (
              <div style={{ fontWeight: 900, fontSize: compact ? '15px' : '17px', color: '#fff', whiteSpace: 'nowrap' }}>
                {match.home_score ?? 0}
                <span style={{ color: '#374151', margin: '0 3px' }}>-</span>
                {match.away_score ?? 0}
              </div>
            ) : (
              <div style={{ color: '#374151', fontSize: '11px', fontWeight: 600 }}>
                {new Date(match.match_date) > new Date()
                  ? new Date(match.match_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                  : 'VS'}
              </div>
            )}
            {isLive && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <span style={{ width: '5px', height: '5px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                <span style={{ color: '#ef4444', fontSize: '9px', fontWeight: 700 }}>VIVO</span>
              </div>
            )}
          </div>

          {/* Visitante */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
            <span style={{
              fontWeight: isTBD ? 400 : 600, color: isTBD ? '#374151' : '#f0f0f5',
              fontSize: compact ? '12px' : '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right',
            }}>
              {match.away_team}
            </span>
            <Flag url={match.away_team_flag} code={match.away_team_code} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function GroupTable({ matches }: { matches: Match[] }) {
  // Calcular tabla de posiciones del grupo
  const teams: Record<string, { name: string; flag: string | null; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }> = {}

  matches.forEach(m => {
    if (m.status !== 'FINISHED' || m.home_score === null || m.away_score === null) return
    const addTeam = (name: string, flag: string | null) => {
      if (!teams[name]) teams[name] = { name, flag, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }
    }
    addTeam(m.home_team, m.home_team_flag)
    addTeam(m.away_team, m.away_team_flag)

    const h = m.home_score, a = m.away_score
    teams[m.home_team].played++; teams[m.away_team].played++
    teams[m.home_team].gf += h; teams[m.home_team].ga += a
    teams[m.away_team].gf += a; teams[m.away_team].ga += h
    if (h > a) { teams[m.home_team].won++; teams[m.home_team].pts += 3; teams[m.away_team].lost++ }
    else if (h < a) { teams[m.away_team].won++; teams[m.away_team].pts += 3; teams[m.home_team].lost++ }
    else { teams[m.home_team].drawn++; teams[m.home_team].pts++; teams[m.away_team].drawn++; teams[m.away_team].pts++ }
  })

  const sorted = Object.values(teams).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
  if (sorted.length === 0) return null

  return (
    <div style={{ background: '#0a0a0f', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 32px', gap: '4px', padding: '6px 10px', borderBottom: '1px solid #1e1e2e' }}>
        {['Equipo', 'PJ', 'G', 'E', 'P', 'Pts'].map(h => (
          <span key={h} style={{ color: '#6b7280', fontSize: '10px', fontWeight: 700, textAlign: h === 'Equipo' ? 'left' : 'center' }}>{h}</span>
        ))}
      </div>
      {sorted.map((t, i) => (
        <div key={t.name} style={{
          display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 32px',
          gap: '4px', padding: '7px 10px', borderBottom: '1px solid #1e1e2e',
          background: i < 2 ? 'rgba(59,130,246,0.05)' : 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {i < 2 && <span style={{ width: '3px', height: '16px', background: '#3b82f6', borderRadius: '2px', flexShrink: 0 }} />}
            {i === 2 && <span style={{ width: '3px', height: '16px', background: '#f59e0b', borderRadius: '2px', flexShrink: 0 }} />}
            {i > 2 && <span style={{ width: '3px', height: '16px', background: 'transparent', flexShrink: 0 }} />}
            <Flag url={t.flag} code={t.name.slice(0, 3).toUpperCase()} />
            <span style={{ color: '#f0f0f5', fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
          </div>
          {[t.played, t.won, t.drawn, t.lost].map((v, j) => (
            <span key={j} style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>{v}</span>
          ))}
          <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 800, textAlign: 'center' }}>{t.pts}</span>
        </div>
      ))}
    </div>
  )
}

export default function FixtureView({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState<Tab>('grupos')

  const groups = ['GROUP_A','GROUP_B','GROUP_C','GROUP_D','GROUP_E','GROUP_F','GROUP_G','GROUP_H','GROUP_I','GROUP_J','GROUP_K','GROUP_L']
  const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE')
  const knockoutMatches = matches.filter(m => m.stage !== 'GROUP_STAGE')

  const byGroup = groups.reduce((acc, g) => {
    const gm = groupMatches.filter(m => m.group_name === g)
    if (gm.length) acc[g] = gm
    return acc
  }, {} as Record<string, Match[]>)

  const byStage = STAGE_ORDER.reduce((acc, s) => {
    const sm = knockoutMatches.filter(m => m.stage === s)
    if (sm.length) acc[s] = sm
    return acc
  }, {} as Record<string, Match[]>)

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
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              FIFA World Cup 2026 · {matches.length} partidos
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.5rem' }}>
              {matches.filter(m => m.status === 'FINISHED').length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>jugados</div>
          </div>
        </div>
      </div>

      {/* En vivo */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
            <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>En Vivo</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#0a0a0f', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
        {([['grupos', '⚽ Fase de Grupos'], ['eliminatorias', '⚔️ Eliminatorias']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === v ? '#1e1e2e' : 'transparent',
            color: tab === v ? '#f0f0f5' : '#6b7280',
            fontWeight: tab === v ? 700 : 400, fontSize: '14px', transition: 'all 0.2s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* GRUPOS */}
      {tab === 'grupos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {Object.entries(byGroup).map(([group, gMatches]) => {
            const label = group.replace('GROUP_', 'Grupo ')
            const finished = gMatches.filter(m => m.status === 'FINISHED').length
            return (
              <div key={group} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '14px', overflow: 'hidden' }}>
                {/* Cabecera del grupo */}
                <div style={{
                  padding: '12px 14px', borderBottom: '1px solid #1e1e2e',
                  background: 'linear-gradient(90deg, #003087, #0050c8)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>{label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{finished}/{gMatches.length} jugados</span>
                </div>

                <div style={{ padding: '10px' }}>
                  {/* Tabla de posiciones */}
                  <GroupTable matches={gMatches} />

                  {/* Partidos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {gMatches.map(m => <MatchCard key={m.id} match={m} compact />)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ELIMINATORIAS */}
      {tab === 'eliminatorias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {Object.entries(byStage).map(([stage, stageMatches]) => (
            <div key={stage}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px',
              }}>
                <div style={{ flex: 1, height: '1px', background: '#1e1e2e' }} />
                <span style={{
                  color: stage === 'FINAL' ? '#f59e0b' : '#94a3b8',
                  fontWeight: 800, fontSize: '13px', textTransform: 'uppercase',
                  letterSpacing: '1px', whiteSpace: 'nowrap',
                  textShadow: stage === 'FINAL' ? '0 0 20px rgba(245,158,11,0.5)' : 'none',
                }}>
                  {STAGE_LABEL[stage] || stage}
                </span>
                <div style={{ flex: 1, height: '1px', background: '#1e1e2e' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                {stageMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
