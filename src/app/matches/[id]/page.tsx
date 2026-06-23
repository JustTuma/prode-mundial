import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import PredictionForm from '@/components/predictions/PredictionForm'
import { notFound } from 'next/navigation'

export const revalidate = 30

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [matchRes, predRes] = await Promise.all([
    supabase.from('matches').select('*').eq('id', id).single(),
    user ? supabase.from('predictions').select('*').eq('match_id', id).eq('user_id', user.id).single() : { data: null },
  ])

  if (!matchRes.data) notFound()

  const match = matchRes.data
  const prediction = predRes.data
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const canPredict = !isFinished && !isLive && !!user

  const { data: allPreds } = await supabase
    .from('predictions')
    .select('home_score_pred, away_score_pred')
    .eq('match_id', id)

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #12121a)',
        border: '1px solid', borderColor: isLive ? '#ef4444' : '#1e1e2e',
        borderRadius: '16px', padding: '24px', marginBottom: '24px', position: 'relative',
      }}>
        {isLive && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ef4444, #f59e0b)' }} />
        )}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            {match.group_name || match.stage} · {formatDate(match.match_date)}
          </span>
        </div>
        {isLive && (
          <div style={{ textAlign: 'center', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
            <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '14px' }}>EN VIVO {match.minute && `· ${match.minute}'`}</span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              {match.home_team_flag ? <img src={match.home_team_flag} style={{ width: '48px', height: '48px', objectFit: 'contain' }} alt="" /> : '🏳️'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#f0f0f5' }}>{match.home_team}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>{match.home_team_code}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            {isFinished || isLive ? (
              <div>
                <div style={{ fontWeight: 900, fontSize: '3rem', color: '#f0f0f5', lineHeight: 1 }}>
                  {match.home_score ?? 0}<span style={{ color: '#6b7280', margin: '0 8px' }}>-</span>{match.away_score ?? 0}
                </div>
                {isFinished && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>Final</div>}
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#6b7280' }}>VS</div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                  {new Date(match.match_date) > new Date()
                    ? `En ${Math.ceil((new Date(match.match_date).getTime() - Date.now()) / 86400000)} días`
                    : 'Próximamente'}
                </div>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              {match.away_team_flag ? <img src={match.away_team_flag} style={{ width: '48px', height: '48px', objectFit: 'contain' }} alt="" /> : '🏳️'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#f0f0f5' }}>{match.away_team}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>{match.away_team_code}</div>
          </div>
        </div>
        {match.venue && (
          <div style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280', fontSize: '12px' }}>
            📍 {match.city && `${match.city} · `}{match.venue}
          </div>
        )}
      </div>

      {user && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>🎯 Tu Predicción</h2>
          {canPredict ? (
            <PredictionForm matchId={match.id} homeTeam={match.home_team} awayTeam={match.away_team} existingPrediction={prediction} />
          ) : prediction ? (
            <div style={{
              background: '#12121a', border: '1px solid',
              borderColor: prediction.is_exact ? '#f59e0b44' : prediction.is_correct_result ? '#10b98144' : isFinished ? '#ef444444' : '#1e1e2e',
              borderRadius: '12px', padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>
                {prediction.is_exact ? '🎯' : prediction.is_correct_result ? '✅' : isFinished ? '❌' : '⏳'}
              </div>
              <div style={{ fontWeight: 800, fontSize: '2rem', color: '#f0f0f5' }}>
                {prediction.home_score_pred} - {prediction.away_score_pred}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Tu predicción</div>
              {isFinished && (
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: prediction.is_exact ? '#f59e0b' : prediction.is_correct_result ? '#10b981' : '#ef4444' }}>
                    {prediction.is_exact ? '🏆 ¡Resultado exacto!' : prediction.is_correct_result ? '👍 Resultado correcto' : '😔 Sin puntos'}
                  </span>
                  {prediction.points_earned > 0 && (
                    <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.5rem', marginTop: '8px' }}>+{prediction.points_earned} puntos</div>
                  )}
                </div>
              )}
            </div>
          ) : isFinished || isLive ? (
            <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
              {isLive ? '⏳ El partido ya empezó' : '🔒 El partido ya terminó'}
            </div>
          ) : null}
        </div>
      )}

      {allPreds && allPreds.length > 0 && (
        <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📊 Predicciones del grupo ({allPreds.length})
          </h3>
          {(() => {
            const homeWins = allPreds.filter(p => p.home_score_pred > p.away_score_pred).length
            const draws = allPreds.filter(p => p.home_score_pred === p.away_score_pred).length
            const awayWins = allPreds.filter(p => p.home_score_pred < p.away_score_pred).length
            const total = allPreds.length
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { label: match.home_team, pct: Math.round(homeWins / total * 100), color: '#3b82f6' },
                  { label: 'Empate', pct: Math.round(draws / total * 100), color: '#6b7280' },
                  { label: match.away_team, pct: Math.round(awayWins / total * 100), color: '#8b5cf6' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: s.color }}>{s.pct}%</div>
                    <div style={{ background: '#1e1e2e', height: '4px', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ background: s.color, height: '100%', width: `${s.pct}%` }} />
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
