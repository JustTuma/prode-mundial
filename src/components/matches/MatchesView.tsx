'use client'
import { useState } from 'react'
import Link from 'next/link'
import { getStageLabel, formatDate } from '@/lib/utils'
import type { Match, Prediction } from '@/lib/types'

type View = 'proximos' | 'grupos'

function Flag({ url, code }: { url: string | null; code: string }) {
  if (url) return <img src={url} style={{ width: '28px', height: '20px', objectFit: 'contain', borderRadius: '2px' }} alt={code} />
  try {
    const flag = code.length === 2
      ? String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
      : ''
    return <span style={{ fontSize: '20px', lineHeight: 1 }}>{flag || '🏳️'}</span>
  } catch { return <span style={{ fontSize: '20px' }}>🏳️</span> }
}

function MatchCard({ match, pred, user }: { match: Match, pred: Prediction | undefined, user: any }) {
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isPast = new Date(match.match_date) < new Date()
  const canPredict = !isFinished && !isLive && !isPast && user && !pred
  const hasPred = !!pred && !isFinished

  let bg = '#12121a', borderColor = '#1e1e2e'
  if (isLive) { bg = '#1a0a0a'; borderColor = '#ef4444' }
  else if (isFinished) { bg = '#0f0f0f'; borderColor = '#2a2a3e' }
  else if (hasPred) { bg = '#12121a'; borderColor = '#f59e0b44' }
  else if (canPredict) { bg = '#0d1a12'; borderColor = '#10b98155' }

  return (
    <Link href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: bg, border: `1px solid ${borderColor}`,
        borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        opacity: isFinished && !pred ? 0.7 : 1,
      }}>
        {isLive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #ef4444, #f59e0b)' }} />}
        {canPredict && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>{formatDate(match.match_date)}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {isLive && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                {`EN VIVO${match.minute ? ` ${match.minute}'` : ''}`}
              </span>
            )}
            {isFinished && <span style={{ color: '#6b7280', fontSize: '11px', background: '#1e1e2e', padding: '2px 8px', borderRadius: '99px' }}>Finalizado</span>}
            {canPredict && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, background: '#10b98122', padding: '2px 8px', borderRadius: '99px' }}>¡Predecir!</span>}
            {hasPred && <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, background: '#f59e0b22', padding: '2px 8px', borderRadius: '99px' }}>✓ Predicho</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flag url={match.home_team_flag} code={match.home_team_code} />
            <div>
              <div style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '14px', lineHeight: 1.2 }}>{match.home_team}</div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>{match.home_team_code}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', minWidth: '72px' }}>
            {isFinished || isLive
              ? <div style={{ fontWeight: 900, fontSize: '20px', color: '#f0f0f5' }}>{match.home_score ?? 0} - {match.away_score ?? 0}</div>
              : <div style={{ fontWeight: 700, fontSize: '13px', color: '#6b7280' }}>VS</div>
            }
            {pred && (
              <div style={{ fontSize: '11px', marginTop: '2px' }}>
                <span style={{ fontWeight: 700, color: pred.is_exact ? '#f59e0b' : pred.is_correct_result ? '#10b981' : isFinished ? '#ef4444' : '#94a3b8' }}>
                  {pred.home_score_pred}-{pred.away_score_pred}
                </span>
                {isFinished && pred.points_earned > 0 && <span style={{ color: '#f59e0b', fontWeight: 800 }}> +{pred.points_earned}pts</span>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '14px', lineHeight: 1.2 }}>{match.away_team}</div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>{match.away_team_code}</div>
            </div>
            <Flag url={match.away_team_flag} code={match.away_team_code} />
          </div>
        </div>
        {match.city && <div style={{ color: '#374151', fontSize: '10px', marginTop: '8px' }}>📍 {match.city}</div>}
      </div>
    </Link>
  )
}

export default function MatchesView({ matches, predictions, user }: { matches: Match[], predictions: Prediction[], user: any }) {
  const [view, setView] = useState<View>('proximos')
  const predMap = new Map(predictions.map(p => [p.match_id, p]))

  const now = new Date()
  const stages = ['GROUP_STAGE', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']

  // Vista próximos: todos ordenados por fecha, primero los no jugados
  const upcomingFirst = [...matches].sort((a, b) => {
    const aFinished = a.status === 'FINISHED'
    const bFinished = b.status === 'FINISHED'
    if (aFinished && !bFinished) return 1
    if (!aFinished && bFinished) return -1
    return new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  })

  const byStage = stages.reduce((acc, s) => {
    const sm = matches.filter(m => m.stage === s)
    if (sm.length) acc[s] = sm
    return acc
  }, {} as Record<string, Match[]>)

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: 800 }}>⚽ Partidos</h1>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '4px', background: '#0a0a0f', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
        {([['proximos', '🕐 Próximos'], ['grupos', '🗂️ Por grupos']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: view === v ? '#1e1e2e' : 'transparent',
            color: view === v ? '#f0f0f5' : '#6b7280',
            fontWeight: view === v ? 700 : 400,
            fontSize: '14px', transition: 'all 0.2s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { color: '#0d1a12', border: '#10b98155', label: 'Podés predecir' },
          { color: '#12121a', border: '#f59e0b44', label: 'Ya predijiste' },
          { color: '#0f0f0f', border: '#2a2a3e', label: 'Finalizado' },
          { color: '#1a0a0a', border: '#ef4444', label: 'En vivo' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color, border: `1px solid ${l.border}` }} />
            <span style={{ color: '#6b7280', fontSize: '11px' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Vista: Próximos */}
      {view === 'proximos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {upcomingFirst.map(match => (
            <MatchCard key={match.id} match={match} pred={predMap.get(match.id)} user={user} />
          ))}
        </div>
      )}

      {/* Vista: Por grupos */}
      {view === 'grupos' && Object.entries(byStage).map(([stage, stageMatches]) => (
        <section key={stage} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #1e1e2e' }}>
            {getStageLabel(stage)}
          </h2>
          {stage === 'GROUP_STAGE' ? (
            Object.entries(
              stageMatches.reduce((acc, m) => {
                const g = m.group_name || 'Sin grupo'
                if (!acc[g]) acc[g] = []
                acc[g].push(m)
                return acc
              }, {} as Record<string, Match[]>)
            ).sort(([a], [b]) => a.localeCompare(b)).map(([group, gMatches]) => (
              <div key={group} style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, margin: '0 0 8px', paddingLeft: '4px' }}>{group}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {gMatches.map(match => <MatchCard key={match.id} match={match} pred={predMap.get(match.id)} user={user} />)}
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stageMatches.map(match => <MatchCard key={match.id} match={match} pred={predMap.get(match.id)} user={user} />)}
            </div>
          )}
        </section>
      ))}

      {matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚽</div>
          <p style={{ color: '#94a3b8' }}>Cargando partidos...</p>
        </div>
      )}
    </div>
  )
}
