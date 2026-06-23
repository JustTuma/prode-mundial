import { createClient } from '@/lib/supabase/server'
import EditProfileForm from '@/components/profile/EditProfileForm'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, achievementsRes, rankRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id),
    supabase.from('profiles').select('id').order('total_points', { ascending: false }),
  ])

  const profile = profileRes.data
  const achievements = achievementsRes.data || []
  const rank = (rankRes.data || []).findIndex(p => p.id === user.id) + 1

  const allAchievements = [
    { id: 'first_pred', name: 'Primera Predicción', emoji: '🎯', description: 'Hiciste tu primera predicción' },
    { id: 'exacto_1', name: 'Ojo de Águila', emoji: '🦅', description: '1 resultado exacto' },
    { id: 'exacto_5', name: 'Adivino', emoji: '🔮', description: '5 resultados exactos' },
    { id: 'exacto_10', name: 'Mago del Prode', emoji: '🧙', description: '10 resultados exactos' },
    { id: 'points_50', name: 'En Racha', emoji: '🔥', description: '50 puntos acumulados' },
    { id: 'points_100', name: 'Centurión', emoji: '💯', description: '100 puntos acumulados' },
    { id: 'points_200', name: 'Leyenda', emoji: '🏆', description: '200 puntos acumulados' },
    { id: 'all_group', name: 'Fanático', emoji: '⚽', description: 'Predijiste todos los de grupos' },
    { id: 'champion_correct', name: 'El Oráculo', emoji: '🌟', description: 'Acertaste al campeón' },
    { id: 'streak_3', name: 'Invicto', emoji: '⚡', description: '3 predicciones correctas seguidas' },
  ]

  const earnedIds = new Set(achievements.map(a => a.achievement_id))
  const accuracy = profile?.predictions_made > 0 ? Math.round((profile.correct_results / profile.predictions_made) * 100) : 0

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Profile header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #12121a)',
        border: '1px solid #1e1e2e', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 12px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 900, fontSize: '32px',
        }}>
          {profile?.username?.[0]?.toUpperCase()}
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800 }}>{profile?.username}</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Miembro desde {new Date(profile?.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
          {[
            { label: 'Puntos', value: profile?.total_points || 0, color: '#f59e0b', emoji: '⭐' },
            { label: 'Ranking', value: rank ? `#${rank}` : '-', color: '#3b82f6', emoji: '🏅' },
            { label: 'Exactos', value: profile?.exact_scores || 0, color: '#10b981', emoji: '🎯' },
            { label: 'Precisión', value: `${accuracy}%`, color: '#8b5cf6', emoji: '📊' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.3rem', color: s.color }}>{s.value}</div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Estadísticas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Predicciones hechas', value: profile?.predictions_made || 0 },
            { label: 'Resultados correctos', value: profile?.correct_results || 0 },
            { label: 'Resultados exactos', value: profile?.exact_scores || 0 },
            { label: 'Total de puntos', value: profile?.total_points || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: '#1e1e2e', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#f0f0f5' }}>{s.value}</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🏆 Logros ({earnedIds.size}/{allAchievements.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
          {allAchievements.map(a => {
            const earned = earnedIds.has(a.id)
            return (
              <div key={a.id} style={{
                background: earned ? '#1e1e2e' : '#0a0a0f',
                border: `1px solid ${earned ? '#f59e0b44' : '#1e1e2e'}`,
                borderRadius: '10px', padding: '12px', textAlign: 'center',
                opacity: earned ? 1 : 0.4,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '6px', filter: earned ? 'none' : 'grayscale(100%)' }}>
                  {a.emoji}
                </div>
                <div style={{ fontWeight: 600, fontSize: '12px', color: earned ? '#f0f0f5' : '#6b7280' }}>{a.name}</div>
                <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>{a.description}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit profile */}
      <EditProfileForm profile={profile} />

      <div style={{ marginTop: '16px' }}>
        <Link href="/predict/bonus">
          <button className="btn-gold" style={{ width: '100%' }}>🌟 Ver mis predicciones bonus</button>
        </Link>
      </div>
    </div>
  )
}
