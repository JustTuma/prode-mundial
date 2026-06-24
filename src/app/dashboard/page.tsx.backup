import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, matchesRes, predictionsRes, rankRes, liveRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('matches').select('*').gte('match_date', new Date().toISOString()).order('match_date').limit(3),
    supabase.from('predictions').select('*, matches(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id').order('total_points', { ascending: false }),
    supabase.from('matches').select('*').in('status', ['IN_PLAY', 'PAUSED', 'LIVE']).limit(3),
  ])

  const profile = profileRes.data
  const upcomingMatches = matchesRes.data || []
  const recentPredictions = predictionsRes.data || []
  const liveMatches = liveRes.data || []
  const rank = (rankRes.data || []).findIndex(p => p.id === user.id) + 1
  const accuracy = profile?.predictions_made > 0
    ? Math.round((profile.correct_results / profile.predictions_made) * 100) : 0

  const greetings = ['¡Dale campeón!', '¡Vamos Argentina!', '¡A meter goles!', '¡Esta es la nuestra!', '¡Arriba los prodes!']
  const greeting = greetings[new Date().getMinutes() % greetings.length]

  return (
    <div style={{ paddingBottom: '100px' }}>

      {/* HERO BANNER */}
      <div style={{
        position: 'relative', borderRadius: '20px', overflow: 'hidden',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #003087 0%, #0050c8 40%, #1a8cff 70%, #75aadb 100%)',
        padding: '28px 24px',
      }}>
        {/* Rayas celeste y blanco estilo camiseta Argentina */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(255,255,255,0.07) 18px, rgba(255,255,255,0.07) 36px)',
          pointerEvents: 'none',
        }} />
        {/* Brillo superior */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '28px' }}>🇦🇷</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {greeting}
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {profile?.username}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', fontSize: '13px' }}>
              🏆 Mundial FIFA 2026
            </p>
          </div>

          {/* Avatar */}
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'white', fontWeight: 900, fontSize: '24px' }}>{profile?.username?.[0]?.toUpperCase()}</span>
            }
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          position: 'relative',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px', marginTop: '20px',
        }}>
          {[
            { label: 'Puntos', value: profile?.total_points ?? 0, emoji: '⭐' },
            { label: 'Ranking', value: rank ? `#${rank}` : '-', emoji: '🏅' },
            { label: 'Exactos', value: profile?.exact_scores ?? 0, emoji: '🎯' },
            { label: 'Precisión', value: `${accuracy}%`, emoji: '📊' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '10px 8px',
              textAlign: 'center', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '16px', marginBottom: '2px' }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '1px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Barra de precisión */}
        {profile?.predictions_made > 0 && (
          <div style={{ position: 'relative', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Precisión general</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{profile.predictions_made} predicciones</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '99px', height: '6px' }}>
              <div style={{
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                borderRadius: '99px', height: '100%', width: `${accuracy}%`, transition: 'width 0.5s',
                boxShadow: '0 0 8px rgba(251,191,36,0.6)',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* PARTIDOS EN VIVO */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>En Vivo Ahora</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liveMatches.map((match: any) => (
              <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#1a0a0a', border: '1px solid #ef444466',
                  borderRadius: '14px', padding: '14px 16px', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '15px' }}>{match.home_team}</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 900, fontSize: '20px', color: '#fff' }}>{match.home_score ?? 0} - {match.away_score ?? 0}</div>
                      <div style={{ color: '#ef4444', fontSize: '10px', fontWeight: 700 }}>
                        {match.status === 'PAUSED' ? 'PAUSA' : match.minute ? `${match.minute}'` : 'EN VIVO'}
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '15px', textAlign: 'right' }}>{match.away_team}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        {/* PRÓXIMOS PARTIDOS */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚽ Próximos</h2>
            <Link href="/matches" style={{ color: '#75aadb', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          {upcomingMatches.length === 0 ? (
            <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
              No hay partidos próximos
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingMatches.map((match: any) => (
                <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card-hover" style={{
                    background: '#12121a', border: '1px solid #1e1e2e',
                    borderRadius: '12px', padding: '14px', cursor: 'pointer',
                  }}>
                    <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#75aadb', fontWeight: 600 }}>{match.group_name || match.stage}</span>
                      <span>{formatDate(match.match_date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '14px' }}>{match.home_team}</span>
                      <span style={{
                        background: 'linear-gradient(135deg, #003087, #0050c8)',
                        color: '#fff', fontWeight: 800, fontSize: '12px',
                        padding: '4px 10px', borderRadius: '8px',
                      }}>VS</span>
                      <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '14px', textAlign: 'right' }}>{match.away_team}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* MIS PREDICCIONES */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎯 Mis Predicciones</h2>
            <Link href="/matches" style={{ color: '#75aadb', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>Predecir →</Link>
          </div>
          {recentPredictions.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, #0d1a12, #12121a)',
              border: '1px solid #10b98133', borderRadius: '12px', padding: '28px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎯</div>
              <p style={{ color: '#94a3b8', margin: '0 0 14px', fontWeight: 600 }}>¡Todavía no predijiste nada!</p>
              <Link href="/matches">
                <button style={{
                  background: 'linear-gradient(135deg, #003087, #0050c8)',
                  color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px',
                }}>
                  ⚽ Empezar a predecir
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentPredictions.map((pred: any) => {
                const match = pred.matches
                const isFinished = match?.status === 'FINISHED'
                return (
                  <div key={pred.id} style={{
                    background: '#12121a', border: '1px solid',
                    borderRadius: '12px', padding: '12px 14px',
                    borderColor: pred.is_exact ? '#f59e0b44' : pred.is_correct_result ? '#10b98144' : '#1e1e2e',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#f0f0f5', fontWeight: 800, fontSize: '18px' }}>
                        {pred.home_score_pred} - {pred.away_score_pred}
                      </span>
                      {isFinished && (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
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

      {/* ACCESOS RÁPIDOS */}
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Accesos rápidos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { href: '/predict/bonus', emoji: '🌟', label: 'Bonus', desc: 'Campeón y goleador', color: '#f59e0b' },
            { href: '/ranking', emoji: '🏅', label: 'Ranking', desc: 'Tabla global', color: '#3b82f6' },
            { href: '/profile', emoji: '🏆', label: 'Mis Logros', desc: 'Badges', color: '#10b981' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
              <div className="card-hover" style={{
                background: '#12121a', border: `1px solid ${a.color}22`,
                borderRadius: '14px', padding: '16px 12px', cursor: 'pointer', textAlign: 'center',
              }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>{a.emoji}</div>
                <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '13px' }}>{a.label}</div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
