import { createClient } from '@/lib/supabase/server'
import { formatDate, matchLabel } from '@/lib/utils'
import PredictionForm from '@/components/predictions/PredictionForm'
import TeamAvatar from '@/components/ui/TeamAvatar'
import { notFound } from 'next/navigation'

export const revalidate = 0

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
  const canPredict = !isFinished && !isLive && !!user && new Date(match.match_date).getTime() > Date.now()

  const { data: allPreds } = await supabase.from('predictions').select('home_score_pred, away_score_pred').eq('match_id', id)

  return (
    <div className="risein" style={{ paddingBottom: '40px' }}>
      <div className="card" style={{ padding: '24px', marginBottom: '20px', position: 'relative', overflow: 'hidden', borderColor: isLive ? 'var(--neg)' : 'var(--line)' }}>
        {isLive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--neg), var(--accent2))' }} />}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 700 }}>{matchLabel(match.group_name, match.stage)} · {formatDate(match.match_date)}</span>
        </div>
        {isLive && (
          <div style={{ textAlign: 'center', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--neg)', borderRadius: '50%' }} className="animate-pulse" />
            <span style={{ color: 'var(--neg)', fontWeight: 800, fontSize: '14px' }}>{match.status === 'PAUSED' ? 'PAUSA' : 'EN VIVO'}{match.minute ? ` · ${match.minute}'` : ''}</span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <TeamAvatar name={match.home_team} code={match.home_team_code} flag={match.home_team_flag} size={56} />
            <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink)', textAlign: 'center' }}>{match.home_team}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            {isFinished || isLive ? (
              <div className="font-display" style={{ fontSize: '3rem', color: 'var(--ink)', lineHeight: 1 }}>{match.home_score ?? 0}<span style={{ color: 'var(--muted)', margin: '0 6px' }}>-</span>{match.away_score ?? 0}</div>
            ) : (
              <div className="font-display" style={{ fontSize: '1.5rem', color: 'var(--muted)' }}>VS</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <TeamAvatar name={match.away_team} code={match.away_team_code} flag={match.away_team_flag} size={56} />
            <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink)', textAlign: 'center' }}>{match.away_team}</span>
          </div>
        </div>
        {match.city && <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--muted)', fontSize: '12px' }}>📍 {match.city}</div>}
      </div>

      {user && (
        <div style={{ marginBottom: '20px' }}>
          <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)', marginBottom: '12px' }}>Tu pronóstico</h2>
          {canPredict ? (
            <PredictionForm matchId={match.id} homeTeam={match.home_team} awayTeam={match.away_team} homeFlag={match.home_team_flag} awayFlag={match.away_team_flag} existingPrediction={prediction} />
          ) : prediction ? (
            <div className="card" style={{ padding: '20px', textAlign: 'center', borderColor: prediction.is_exact ? 'var(--accent2)' : prediction.is_correct_result ? 'var(--pos)' : isFinished ? 'var(--neg)' : 'var(--line)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{prediction.is_exact ? '🎯' : prediction.is_correct_result ? '✅' : isFinished ? '❌' : '⏳'}</div>
              <div className="font-display" style={{ fontSize: '2rem', color: 'var(--ink)' }}>{prediction.home_score_pred} - {prediction.away_score_pred}</div>
              {isFinished && prediction.points_earned > 0 && <div style={{ color: 'var(--accent2)', fontWeight: 800, fontSize: '1.3rem', marginTop: '8px' }}>+{prediction.points_earned} pts</div>}
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>{isLive ? 'El partido ya empezó' : 'El partido ya terminó'}</div>
          )}
        </div>
      )}

      {allPreds && allPreds.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 className="font-display" style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: '12px' }}>Pronósticos del grupo ({allPreds.length})</h3>
          {(() => {
            const hw = allPreds.filter(p => p.home_score_pred > p.away_score_pred).length
            const d = allPreds.filter(p => p.home_score_pred === p.away_score_pred).length
            const aw = allPreds.filter(p => p.home_score_pred < p.away_score_pred).length
            const t = allPreds.length
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[{ l: match.home_team, p: Math.round(hw / t * 100) }, { l: 'Empate', p: Math.round(d / t * 100) }, { l: match.away_team, p: Math.round(aw / t * 100) }].map(s => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <div className="font-display" style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{s.p}%</div>
                    <div style={{ background: 'var(--surface2)', height: '4px', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}><div style={{ background: 'var(--accent)', height: '100%', width: `${s.p}%` }} /></div>
                    <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.l}</div>
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
