import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  const [profileRes, rankRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('username', decodeURIComponent(username)).single(),
    supabase.from('profiles').select('id').order('total_points', { ascending: false }),
  ])

  if (!profileRes.data) notFound()
  const profile = profileRes.data
  const rank = (rankRes.data || []).findIndex(p => p.id === profile.id) + 1
  const isMe = me?.id === profile.id

  const [predsRes, achievementsRes] = await Promise.all([
    supabase.from('predictions')
      .select('*, matches(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', profile.id),
  ])

  const predictions = predsRes.data || []
  const earnedIds = new Set((achievementsRes.data || []).map(a => a.achievement_id))
  const accuracy = profile.predictions_made > 0
    ? Math.round((profile.correct_results / profile.predictions_made) * 100) : 0

  const allAchievements = [
    { id: 'first_pred', name: 'Primera Predicción', emoji: '🎯' },
    { id: 'exacto_1', name: 'Ojo de Águila', emoji: '🦅' },
    { id: 'exacto_5', name: 'Adivino', emoji: '🔮' },
    { id: 'exacto_10', name: 'Mago del Prode', emoji: '🧙' },
    { id: 'points_50', name: 'En Racha', emoji: '🔥' },
    { id: 'points_100', name: 'Centurión', emoji: '💯' },
    { id: 'points_200', name: 'Leyenda', emoji: '🏆' },
    { id: 'all_group', name: 'Fanático', emoji: '⚽' },
    { id: 'champion_correct', name: 'El Oráculo', emoji: '🌟' },
    { id: 'streak_3', name: 'Invicto', emoji: '⚡' },
  ]

  return (
    <div style={{ paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #003087 0%, #0050c8 60%, #1a8cff 100%)',
        borderRadius: '20px', padding: '28px 24px', marginBottom: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(255,255,255,0.06) 18px, rgba(255,255,255,0.06) 36px)',
        }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'white', fontWeight: 900, fontSize: '28px' }}>{profile.username?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>
              {profile.username} {isMe && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '99px' }}>vos</span>}
            </h1>
            {profile.full_name && <p style={{ color: 'rgba(255,255,255,0.7)', margin: '2px 0 0', fontSize: '14px' }}>{profile.full_name}</p>}
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', fontSize: '12px' }}>
              Desde {new Date(profile.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { label: 'Puntos', value: profile.total_points || 0, emoji: '⭐' },
            { label: 'Ranking', value: rank ? `#${rank}` : '-', emoji: '🏅' },
            { label: 'Exactos', value: profile.exact_scores || 0, emoji: '🎯' },
            { label: 'Precisión', value: `${accuracy}%`, emoji: '📊' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '10px 6px',
              textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logros */}
      {earnedIds.size > 0 && (
        <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🏆 Logros ({earnedIds.size}/{allAchievements.length})
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {allAchievements.filter(a => earnedIds.has(a.id)).map(a => (
              <div key={a.id} style={{
                background: '#1e1e2e', border: '1px solid #f59e0b33',
                borderRadius: '99px', padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ fontSize: '16px' }}>{a.emoji}</span>
                <span style={{ color: '#f0f0f5', fontSize: '12px', fontWeight: 600 }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predicciones */}
      <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🎯 Predicciones ({predictions.length})
          </h2>
        </div>

        {predictions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Todavía no hizo predicciones
          </div>
        ) : (
          <div>
            {predictions.map((pred: any) => {
              const match = pred.matches
              const isFinished = match?.status === 'FINISHED'
              return (
                <div key={pred.id} style={{
                  padding: '14px 18px', borderBottom: '1px solid #1e1e2e',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                  borderLeft: '3px solid',
                  borderLeftColor: pred.is_exact ? '#f59e0b' : pred.is_correct_result ? '#10b981' : isFinished ? '#ef4444' : '#1e1e2e',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {match?.home_team} vs {match?.away_team}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#f0f0f5', fontWeight: 800, fontSize: '16px' }}>
                        {pred.home_score_pred} - {pred.away_score_pred}
                      </span>
                      {isFinished && (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          (real: {match.home_score}-{match.away_score})
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {isFinished ? (
                      <div>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                          background: pred.is_exact ? '#f59e0b22' : pred.is_correct_result ? '#10b98122' : '#ef444422',
                          color: pred.is_exact ? '#f59e0b' : pred.is_correct_result ? '#10b981' : '#ef4444',
                        }}>
                          {pred.is_exact ? '🎯 Exacto' : pred.is_correct_result ? '✅ Correcto' : '❌ Error'}
                        </span>
                        {pred.points_earned > 0 && (
                          <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>
                            +{pred.points_earned} pts
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#374151', fontSize: '11px' }}>Pendiente</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
