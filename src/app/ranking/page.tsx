import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 0

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(100)

  const ranking = profiles || []
  const userRank = user ? ranking.findIndex(p => p.id === user.id) + 1 : 0
  const userProfile = user ? ranking.find(p => p.id === user.id) : null

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>🏅 Ranking Global</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Top pronosticadores del Mundial 2026</p>

      {/* User's position card */}
      {userProfile && userRank > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a3e, #12121a)',
          border: '1px solid #3b82f644',
          borderRadius: '12px', padding: '16px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.3rem' }}>#{userRank}</span>
            <div>
              <div style={{ fontWeight: 700, color: '#f0f0f5' }}>Tu posición</div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>{userProfile.username}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.5rem' }}>{userProfile.total_points}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>puntos</div>
          </div>
        </div>
      )}

      {/* Podium top 3 */}
      {ranking.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[ranking[1], ranking[0], ranking[2]].map((p, i) => {
            const positions = [2, 1, 3]
            const pos = positions[i]
            const colors = ['#94a3b8', '#f59e0b', '#cd7f32']
            const emojis = ['🥈', '🥇', '🥉']
            const heights = ['80%', '100%', '70%']
            return (
              <div key={p.id} style={{
                background: '#12121a', border: `1px solid ${colors[i]}44`,
                borderRadius: '12px', padding: '16px', textAlign: 'center',
                alignSelf: 'flex-end',
                height: heights[i],
              }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{emojis[i]}</div>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 8px',
                  background: `linear-gradient(135deg, ${colors[i]}, ${colors[i]}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', fontWeight: 800, fontSize: '16px',
                  overflow: 'hidden', border: `2px solid ${colors[i]}`,
                }}>
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : p.username?.[0]?.toUpperCase()
                  }
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#f0f0f5', marginBottom: '4px' }}>{p.username}</div>
                <div style={{ color: colors[i], fontWeight: 900, fontSize: '1.2rem' }}>{p.total_points}</div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>pts</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full ranking list */}
      <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e2e', display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>#</span>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>Jugador</span>
          <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'right' }}>Exactos</span>
          <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'right' }}>Correc.</span>
          <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'right' }}>Pts</span>
        </div>

        {ranking.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏅</div>
            <p>Sé el primero en el ranking</p>
          </div>
        ) : (
          ranking.map((p, i) => {
            const isUser = p.id === user?.id
            const rank = i + 1
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
            return (
              <div key={p.id} style={{
                padding: '12px 16px',
                display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto',
                gap: '12px', alignItems: 'center',
                borderBottom: '1px solid #1e1e2e',
                background: isUser ? '#3b82f610' : 'transparent',
                borderLeft: isUser ? '3px solid #3b82f6' : '3px solid transparent',
              }}>
                <span style={{ fontWeight: 700, color: medal ? '#f59e0b' : '#6b7280', fontSize: '14px' }}>
                  {medal || `#${rank}`}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, #3b82f6, #8b5cf6)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '13px',
                    overflow: 'hidden',
                  }}>
                    {p.avatar_url
                      ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : p.username?.[0]?.toUpperCase()
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: isUser ? 700 : 500, color: isUser ? '#f0f0f5' : '#94a3b8', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link href={`/profile/${p.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.username}</Link> {isUser && <span style={{ color: '#3b82f6', fontSize: '11px' }}>(vos)</span>}
                    </div>
                    {p.predictions_made > 0 && (
                      <div style={{ color: '#374151', fontSize: '11px' }}>{p.predictions_made} predicciones</div>
                    )}
                  </div>
                </div>
                <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>{p.exact_scores}</span>
                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>{p.correct_results}</span>
                <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '15px', textAlign: 'right' }}>{p.total_points}</span>
              </div>
            )
          })
        )}
      </div>

      {ranking.length > 0 && (
        <p style={{ color: '#374151', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
          🎯 3 pts por resultado exacto · ✅ 1 pt por resultado correcto
        </p>
      )}
    </div>
  )
}
