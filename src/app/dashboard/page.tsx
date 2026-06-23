import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, matchesRes, predictionsRes, rankRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('matches').select('*').gte('match_date', new Date().toISOString()).order('match_date').limit(3),
    supabase.from('predictions').select('*, matches(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id').order('total_points', { ascending: false }),
  ])

  const profile = profileRes.data
  const upcomingMatches = matchesRes.data || []
  const recentPredictions = predictionsRes.data || []
  const rank = (rankRes.data || []).findIndex(p => p.id === user.id) + 1

  const accuracy = profile && profile.predictions_made > 0
    ? Math.round((profile.correct_results / profile.predictions_made) * 100)
    : 0

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Welcome hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid #1e1e2e', borderRadius: '16px', padding: '24px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              ¡Hola, {profile?.username}! 👋
            </h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Mundial FIFA 2026 · Fase de Grupos</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'Pts', value: profile?.total_points ?? 0, color: '#f59e0b' },
              { label: 'Rank', value: rank ? `#${rank}` : '-', color: '#3b82f6' },
              { label: 'Exactos', value: profile?.exact_scores ?? 0, color: '#10b981' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ color: stat.color, fontWeight: 900, fontSize: '1.5rem' }}>{stat.value}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {profile && profile.predictions_made > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Precisión: {accuracy}%</span>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{profile.predictions_made} predicciones</span>
            </div>
            <div style={{ background: '#1e1e2e', borderRadius: '99px', height: '6px' }}>
              <div style={{ background: `linear-gradient(90deg, #3b82f6, #10b981)`, borderRadius: '99px', height: '100%', width: `${accuracy}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Upcoming matches */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>⚽ Próximos Partidos</h2>
            <Link href="/matches" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          {upcomingMatches.length === 0 ? (
            <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
              No hay partidos próximos
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingMatches.map((match: any) => (
                <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px',
                    padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e2e')}
                  >
                    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{match.group_name || match.stage}</span>
                      <span>{formatDate(match.match_date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '14px' }}>{match.home_team}</span>
                      <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '16px', padding: '0 12px' }}>VS</span>
                      <span style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '14px', textAlign: 'right' }}>{match.away_team}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent predictions */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🎯 Mis Predicciones</h2>
            <Link href="/matches" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>Predecir →</Link>
          </div>
          {recentPredictions.length === 0 ? (
            <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
              <p style={{ color: '#94a3b8', margin: 0 }}>¡Todavía no hiciste predicciones!</p>
              <Link href="/matches">
                <button className="btn-primary" style={{ marginTop: '16px' }}>Predecir ahora</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentPredictions.map((pred: any) => {
                const match = pred.matches
                const isFinished = match?.status === 'FINISHED'
                return (
                  <div key={pred.id} style={{
                    background: '#12121a', border: '1px solid', borderRadius: '12px', padding: '14px',
                    borderColor: pred.is_exact ? '#f59e0b44' : pred.is_correct_result ? '#10b98144' : '#1e1e2e',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>{match?.home_team} vs {match?.away_team}</span>
                      {isFinished && (
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                          background: pred.is_exact ? '#f59e0b22' : pred.is_correct_result ? '#10b98122' : '#ef444422',
                          color: pred.is_exact ? '#f59e0b' : pred.is_correct_result ? '#10b981' : '#ef4444',
                        }}>
                          {pred.is_exact ? '🎯 Exacto' : pred.is_correct_result ? '✅ Correcto' : '❌ Error'}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#f0f0f5', fontWeight: 700, fontSize: '18px' }}>
                        {pred.home_score_pred} - {pred.away_score_pred}
                      </span>
                      {isFinished && (
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>
                          (real: {match.home_score}-{match.away_score})
                        </span>
                      )}
                      {isFinished && pred.points_earned > 0 && (
                        <span style={{ color: '#f59e0b', fontWeight: 800, marginLeft: 'auto', fontSize: '14px' }}>
                          +{pred.points_earned} pts
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '24px' }}>
        {[
          { href: '/leagues', emoji: '👥', label: 'Mis Ligas', desc: 'Ver tus grupos' },
          { href: '/predict/bonus', emoji: '🌟', label: 'Bonus', desc: 'Campeón y goleador' },
          { href: '/ranking', emoji: '🏅', label: 'Ranking', desc: 'Ver tabla global' },
          { href: '/profile', emoji: '🏆', label: 'Mis Logros', desc: 'Badges ganados' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px',
              padding: '16px', cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.transform = '' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{a.emoji}</div>
              <div style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '14px' }}>{a.label}</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
