import { createClient } from '@/lib/supabase/server'
import { getStageLabel, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Match, Prediction } from '@/lib/types'

export const revalidate = 60

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [matchesRes, predictionsRes] = await Promise.all([
    supabase.from('matches').select('*').order('match_date'),
    user ? supabase.from('predictions').select('*').eq('user_id', user.id) : { data: [] },
  ])

  const matches: Match[] = matchesRes.data || []
  const predictions: Prediction[] = predictionsRes.data || []
  const predMap = new Map(predictions.map(p => [p.match_id, p]))

  // Group by stage
  const stages = ['GROUP_STAGE', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']
  const byStage = stages.reduce((acc, s) => {
    const sm = matches.filter(m => m.stage === s)
    if (sm.length) acc[s] = sm
    return acc
  }, {} as Record<string, Match[]>)

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 800 }}>⚽ Partidos</h1>

      {Object.entries(byStage).map(([stage, stageMatches]) => (
        <section key={stage} style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px', fontWeight: 700, color: '#f59e0b',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
            paddingBottom: '8px', borderBottom: '1px solid #1e1e2e',
          }}>
            {getStageLabel(stage)}
          </h2>

          {/* Group by group_name for group stage */}
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
                <MatchList matches={gMatches} predMap={predMap} user={user} />
              </div>
            ))
          ) : (
            <MatchList matches={stageMatches} predMap={predMap} user={user} />
          )}
        </section>
      ))}

      {matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚽</div>
          <p style={{ color: '#94a3b8' }}>Cargando partidos...</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Necesitás configurar la base de datos primero</p>
        </div>
      )}
    </div>
  )
}

function MatchList({ matches, predMap, user }: { matches: Match[], predMap: Map<number, Prediction>, user: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {matches.map(match => {
        const pred = predMap.get(match.id)
        const isFinished = match.status === 'FINISHED'
        const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY'
        const canPredict = !isFinished && !isLive && user
        const isPast = new Date(match.match_date) < new Date()

        return (
          <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#12121a', border: '1px solid',
              borderColor: isLive ? '#ef4444' : pred ? '#3b82f644' : '#1e1e2e',
              borderRadius: '12px', padding: '16px', cursor: 'pointer',
              transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
            }}>
              {isLive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '11px' }}>{formatDate(match.match_date)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isLive && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                      <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                      EN VIVO {match.minute && `${match.minute}'`}
                    </span>
                  )}
                  {isFinished && <span style={{ color: '#6b7280', fontSize: '11px' }}>Finalizado</span>}
                  {!isPast && !isFinished && !isLive && (
                    <span style={{
                      background: canPredict ? '#3b82f622' : '#1e1e2e',
                      color: canPredict ? '#3b82f6' : '#6b7280',
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                    }}>
                      {pred ? '✓ Predicho' : user ? 'Predecir' : 'Próximamente'}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '15px' }}>{match.home_team}</div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>{match.home_team_code}</div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  {isFinished || isLive ? (
                    <div style={{ fontWeight: 900, fontSize: '22px', color: '#f0f0f5' }}>
                      {match.home_score ?? 0} - {match.away_score ?? 0}
                    </div>
                  ) : (
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#6b7280' }}>VS</div>
                  )}
                  {pred && (
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>
                      <span style={{ color: '#6b7280' }}>Tu pred: </span>
                      <span style={{
                        fontWeight: 700,
                        color: pred.is_exact ? '#f59e0b' : pred.is_correct_result ? '#10b981' : isFinished ? '#ef4444' : '#94a3b8',
                      }}>
                        {pred.home_score_pred}-{pred.away_score_pred}
                      </span>
                      {isFinished && pred.points_earned > 0 && (
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}> +{pred.points_earned}</span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '15px' }}>{match.away_team}</div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>{match.away_team_code}</div>
                </div>
              </div>

              {match.venue && (
                <div style={{ color: '#374151', fontSize: '11px', marginTop: '8px' }}>📍 {match.city || match.venue}</div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
